// Google Gemini API service for meeting summarization and discovery report generation

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file before importing anything else
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs/promises';
import { MeetingSummaryStructuredOutput } from '../types/index.js';
import { GEMINI_CONFIG, ERROR_MESSAGES, PROMPTS_CONFIG } from '../config/constants.js';

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 2000,  // Start with 2s delay
  MAX_DELAY_MS: 10000,
  BACKOFF_MULTIPLIER: 2,   // 2s -> 4s -> 8s
};

/**
 * Helper function to implement exponential backoff retry logic
 * @param fn - The async function to retry
 * @param retries - Number of retries remaining
 * @param delay - Current delay in milliseconds
 * @returns The result of the function call
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = RETRY_CONFIG.MAX_RETRIES,
  delay: number = RETRY_CONFIG.INITIAL_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if error is retryable (503 service overload, 429 rate limit, network errors)
    const isRetryable =
      error?.status === 503 ||
      error?.status === 429 ||
      error?.code === 'ECONNRESET' ||
      error?.code === 'ETIMEDOUT';

    if (retries > 0 && isRetryable) {
      console.warn(`API call failed with ${error?.status || error?.code}, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      const nextDelay = Math.min(delay * RETRY_CONFIG.BACKOFF_MULTIPLIER, RETRY_CONFIG.MAX_DELAY_MS);
      return retryWithBackoff(fn, retries - 1, nextDelay);
    }

    // If not retryable or no retries left, throw the error
    throw error;
  }
}

/**
 * Generate a meeting summary from a transcription using Gemini with structured outputs
 * @param transcription - The meeting transcription text
 * @param meetingType - The type of meeting ('discovery', 'regular', or 'annual')
 * @returns Structured output with meeting_summary, adviser_actions, and client_actions
 */
export async function generateSummary(transcription: string, meetingType: string = 'discovery'): Promise<MeetingSummaryStructuredOutput> {
  console.log(`Generating meeting summary with Gemini API (structured outputs) for ${meetingType} meeting...`);

  try {
    // Select prompt and token limit based on meeting type
    // Use discovery prompt for 'discovery', regular prompt for 'regular' and 'annual'
    const isDiscovery = meetingType.toLowerCase() === 'discovery';
    const promptKey = isDiscovery
      ? PROMPTS_CONFIG.MEETING_SUMMARY_DISCOVERY
      : PROMPTS_CONFIG.MEETING_SUMMARY_REGULAR;
    const maxTokens = isDiscovery
      ? GEMINI_CONFIG.MAX_TOKENS.DISCOVERY_MEETING_SUMMARY
      : GEMINI_CONFIG.MAX_TOKENS.MEETING_SUMMARY;

    // Load prompt template (used as system instruction)
    const promptPath = path.join(__dirname, '../', promptKey);
    const systemInstruction = await fs.readFile(promptPath, 'utf-8');

    // Define structured output schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        meeting_summary: {
          type: Type.STRING,
          description: "A concise summary of the meeting with key discussion points"
        },
        adviser_actions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Action items assigned to the financial adviser"
        },
        client_actions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Action items assigned to the client"
        }
      },
      required: ["meeting_summary", "adviser_actions", "client_actions"],
    };

    // Call Gemini API with streaming (with retry logic wrapping entire operation)
    const { responseText, lastCandidate } = await retryWithBackoff(async () => {
      const stream = await ai.models.generateContentStream({
        model: GEMINI_CONFIG.MODEL,
        contents: transcription,  // Transcript as main content
        config: {
          maxOutputTokens: maxTokens,
          temperature: GEMINI_CONFIG.TEMPERATURE,
          responseMimeType: GEMINI_CONFIG.RESPONSE_MIME_TYPE,
          responseSchema: responseSchema,
          systemInstruction: systemInstruction,  // Prompt as system instruction
        },
      });

      // Accumulate streamed chunks
      let text = '';
      let candidate = null;

      try {
        for await (const chunk of stream) {
          if (chunk.candidates && chunk.candidates[0]) {
            candidate = chunk.candidates[0];

            // Check for safety blocks during streaming
            if (candidate.finishReason === 'SAFETY') {
              console.error('Response blocked due to safety concerns');
              throw new Error(ERROR_MESSAGES.AI_SERVICE.SAFETY_BLOCK);
            }
          }

          // Accumulate text from each chunk
          if (chunk.text) {
            text += chunk.text;
          }
        }
      } catch (error: any) {
        // Convert streaming errors to retryable errors
        if (error.message?.includes('fetch failed') || error.code === 'ECONNRESET') {
          // Re-throw with status to trigger retry
          const retryableError: any = new Error(error.message);
          retryableError.status = 503;
          throw retryableError;
        }
        throw error;
      }

      if (!text) {
        // Empty response should trigger retry
        const retryableError: any = new Error('Empty response from Gemini API');
        retryableError.status = 503;
        throw retryableError;
      }

      return { responseText: text, lastCandidate: candidate };
    });

    // Check final finish reason
    if (lastCandidate) {
      if (lastCandidate.finishReason === 'MAX_TOKENS') {
        console.warn('Response truncated due to token limit');
        throw new Error(ERROR_MESSAGES.AI_SERVICE.TOKEN_LIMIT);
      }

      if (lastCandidate.finishReason !== 'STOP' && lastCandidate.finishReason !== undefined) {
        console.error('Unexpected finish reason:', lastCandidate.finishReason);
        throw new Error(ERROR_MESSAGES.AI_SERVICE.FINISH_REASON_ERROR);
      }
    }

    // Parse JSON (guaranteed to be valid by structured outputs)
    const structuredOutput: MeetingSummaryStructuredOutput = JSON.parse(responseText);

    console.log(
      `Summary generated successfully: ` +
      `${structuredOutput.meeting_summary.length} chars, ` +
      `${structuredOutput.adviser_actions.length} adviser actions, ` +
      `${structuredOutput.client_actions.length} client actions`
    );

    return structuredOutput;

  } catch (error) {
    console.error('Error generating summary:', error);

    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      // Pass the actual error message up
      throw new Error(`Failed to generate meeting summary: ${error.message}`);
    }

    throw new Error('Failed to generate meeting summary: Unknown error');
  }
}

/**
 * Generate a discovery report with 4 sections from a meeting transcription
 * @param transcription - The meeting transcription text
 * @returns Object with 4 discovery report sections
 */
export async function generateDiscoveryReport(transcription: string): Promise<{
  riskTolerance: string;
  factFind: string;
  capacityForLoss: string;
  financialObjectives: string;
}> {
  console.log('Generating discovery report with Gemini API...');

  try {
    // Define prompts for each section
    const sections = {
      riskTolerance: `Based on the following financial planning meeting transcription, extract and analyze the client's risk tolerance. Focus on:
- Their reaction to market volatility scenarios
- Past investment experiences
- Comfort with potential losses
- Risk preference statements

Provide a concise analysis in 2-3 paragraphs.

Transcription:
${transcription}`,

      factFind: `Based on the following financial planning meeting transcription, extract key client facts and KYC (Know Your Customer) information. Include:
- Personal details (age, family situation)
- Employment and income
- Assets and liabilities
- Existing protection arrangements
- Estate planning documents

Provide a structured summary in 3-4 paragraphs.

Transcription:
${transcription}`,

      capacityForLoss: `Based on the following financial planning meeting transcription, analyze the client's capacity for loss. Consider:
- Income stability and sources
- Essential vs discretionary expenses
- Emergency fund coverage
- Impact of investment losses on lifestyle
- Time horizon before needing funds

Provide a detailed assessment in 2-3 paragraphs.

Transcription:
${transcription}`,

      financialObjectives: `Based on the following financial planning meeting transcription, identify and document the client's financial objectives. Include:
- Short-term goals (0-5 years)
- Medium-term goals (5-10 years)
- Long-term goals (retirement, legacy)
- Specific financial targets mentioned
- Priority ranking if discussed

Provide a comprehensive summary in 3-4 paragraphs.

Transcription:
${transcription}`,
    };

    // Run all sections in parallel for efficiency (with retry logic and streaming)
    const results = await Promise.all(
      Object.entries(sections).map(async ([key, prompt]) => {
        const text = await retryWithBackoff(async () => {
          const stream = await ai.models.generateContentStream({
            model: GEMINI_CONFIG.MODEL,
            contents: prompt,
            config: {
              maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS.DISCOVERY_REPORT,
              temperature: GEMINI_CONFIG.TEMPERATURE,
            },
          });

          // Accumulate streamed chunks
          let accumulatedText = '';
          try {
            for await (const chunk of stream) {
              if (chunk.text) {
                accumulatedText += chunk.text;
              }
            }
          } catch (error: any) {
            // Convert streaming errors to retryable errors
            if (error.message?.includes('fetch failed') || error.code === 'ECONNRESET') {
              const retryableError: any = new Error(error.message);
              retryableError.status = 503;
              throw retryableError;
            }
            throw error;
          }

          if (!accumulatedText) {
            const retryableError: any = new Error('Empty response from Gemini API');
            retryableError.status = 503;
            throw retryableError;
          }

          return accumulatedText;
        });

        return [key, text] as [string, string];
      })
    );

    const report = Object.fromEntries(results) as {
      riskTolerance: string;
      factFind: string;
      capacityForLoss: string;
      financialObjectives: string;
    };

    console.log('Discovery report generated successfully');

    return report;
  } catch (error) {
    console.error('Error generating discovery report:', error);
    throw new Error('Failed to generate discovery report');
  }
}

/**
 * Generate a document from a meeting transcription based on a specific template
 * @param transcription - The meeting transcription text
 * @param documentType - The identifier for the document type (e.g., 'discovery_document')
 * @returns The generated document text
 */
export async function generateDocument(transcription: string, documentType: string): Promise<string> {
  console.log(`Generating document of type ${documentType} with Gemini API...`);

  try {
    // 1. Load the system prompt template
    const promptPath = path.join(__dirname, '../', PROMPTS_CONFIG.DOCUMENT_GENERATOR);
    const systemPromptTemplate = await fs.readFile(promptPath, 'utf-8');

    // 2. Load the document description and template data
    const templatesPath = path.join(__dirname, '../', PROMPTS_CONFIG.DOCUMENT_TEMPLATES);
    const templatesData = JSON.parse(await fs.readFile(templatesPath, 'utf-8'));

    // 3. Find the specific template
    // The JSON structure is: { "documentDescriptionTemplates": [ { "key": { "description": "...", "template": "..." } } ] }
    const templateEntry = templatesData.documentDescriptionTemplates.find((entry: any) => entry[documentType]);

    if (!templateEntry) {
      throw new Error(`Document type template not found: ${documentType}`);
    }

    const { description, template } = templateEntry[documentType];

    // 4. Fill the system prompt with the template data
    // Format in document-generator.txt: {{document_description}} and {document_template}
    let systemInstruction = systemPromptTemplate
      .replace('{{document_description}}', description)
      .replace('{document_template}', template);

    // 5. Call Gemini API with streaming (with retry logic wrapping entire operation)
    const responseText = await retryWithBackoff(async () => {
      const stream = await ai.models.generateContentStream({
        model: GEMINI_CONFIG.MODEL,
        contents: transcription, // Transcription as user message
        config: {
          maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS.MEETING_SUMMARY, // Using same token limit as summary for now
          temperature: GEMINI_CONFIG.TEMPERATURE,
          systemInstruction: systemInstruction,
        },
      });

      // Accumulate streamed chunks
      let text = '';
      try {
        for await (const chunk of stream) {
          // Check for safety blocks during streaming
          if (chunk.candidates && chunk.candidates[0]) {
            const candidate = chunk.candidates[0];
            if (candidate.finishReason === 'SAFETY') {
              throw new Error(ERROR_MESSAGES.AI_SERVICE.SAFETY_BLOCK);
            }
          }

          // Accumulate text from each chunk
          if (chunk.text) {
            text += chunk.text;
          }
        }
      } catch (error: any) {
        // Convert streaming errors to retryable errors
        if (error.message?.includes('fetch failed') || error.code === 'ECONNRESET') {
          const retryableError: any = new Error(error.message);
          retryableError.status = 503;
          throw retryableError;
        }
        throw error;
      }

      if (!text) {
        const retryableError: any = new Error('Empty response from Gemini API');
        retryableError.status = 503;
        throw retryableError;
      }

      return text;
    });

    console.log(`Document generated successfully (${responseText.length} chars)`);
    return responseText;

  } catch (error) {
    console.error('Error generating document:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate document');
  }
}

