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
 * Generate a meeting summary from a transcription using Gemini with structured outputs
 * @param transcription - The meeting transcription text
 * @param meetingType - The type of meeting ('discovery', 'regular', or 'annual')
 * @returns Structured output with meeting_summary, adviser_actions, and client_actions
 */
export async function generateSummary(transcription: string, meetingType: string = 'discovery'): Promise<MeetingSummaryStructuredOutput> {
  console.log(`Generating meeting summary with Gemini API (structured outputs) for ${meetingType} meeting...`);

  try {
    // Select prompt based on meeting type
    // Use discovery prompt for 'discovery', regular prompt for 'regular' and 'annual'
    const promptKey = meetingType.toLowerCase() === 'discovery'
      ? PROMPTS_CONFIG.MEETING_SUMMARY_DISCOVERY
      : PROMPTS_CONFIG.MEETING_SUMMARY_REGULAR;

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

    // Call Gemini API with structured outputs
    const response = await ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL,
      contents: transcription,  // Transcript as main content
      config: {
        maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS.MEETING_SUMMARY,
        temperature: GEMINI_CONFIG.TEMPERATURE,
        responseMimeType: GEMINI_CONFIG.RESPONSE_MIME_TYPE,
        responseSchema: responseSchema,
        systemInstruction: systemInstruction,  // Prompt as system instruction
      },
    });

    // Check for safety blocks or other issues
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];

      // Check finish reason
      if (candidate.finishReason === 'SAFETY') {
        console.error('Response blocked due to safety concerns');
        throw new Error(ERROR_MESSAGES.AI_SERVICE.SAFETY_BLOCK);
      }

      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('Response truncated due to token limit');
        throw new Error(ERROR_MESSAGES.AI_SERVICE.TOKEN_LIMIT);
      }

      if (candidate.finishReason !== 'STOP' && candidate.finishReason !== undefined) {
        console.error('Unexpected finish reason:', candidate.finishReason);
        throw new Error(ERROR_MESSAGES.AI_SERVICE.FINISH_REASON_ERROR);
      }
    }

    // Extract text from response
    const responseText = response.text || '';

    if (!responseText) {
      throw new Error('Empty response from Gemini API');
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

    // Run all sections in parallel for efficiency
    const results = await Promise.all(
      Object.entries(sections).map(async ([key, prompt]) => {
        const response = await ai.models.generateContent({
          model: GEMINI_CONFIG.MODEL,
          contents: prompt,
          config: {
            maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS.DISCOVERY_REPORT,
            temperature: GEMINI_CONFIG.TEMPERATURE,
          },
        });

        const text = response.text || '';

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

    // 5. Call Gemini API
    const response = await ai.models.generateContent({
      model: GEMINI_CONFIG.MODEL,
      contents: transcription, // Transcription as user message
      config: {
        maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS.MEETING_SUMMARY, // Using same token limit as summary for now
        temperature: GEMINI_CONFIG.TEMPERATURE,
        systemInstruction: systemInstruction,
      },
    });

    // Check for safety blocks or other issues
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.finishReason === 'SAFETY') {
        throw new Error(ERROR_MESSAGES.AI_SERVICE.SAFETY_BLOCK);
      }
    }

    const responseText = response.text || '';

    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

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

