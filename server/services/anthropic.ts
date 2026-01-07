// Anthropic API service for meeting summarization and discovery report generation

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MeetingSummaryStructuredOutput } from '../types/index.js';
import { ANTHROPIC_CONFIG, ERROR_MESSAGES, PROMPTS_CONFIG } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a meeting summary from a transcription using Claude with structured outputs
 * @param transcription - The meeting transcription text
 * @returns Structured output with meeting_summary, adviser_actions, and client_actions
 */
export async function generateSummary(transcription: string): Promise<MeetingSummaryStructuredOutput> {
  console.log('Generating meeting summary with Claude API (structured outputs)...');

  try {
    // Load prompt template (used as system message)
    const promptPath = path.join(__dirname, '../../', PROMPTS_CONFIG.MEETING_SUMMARY);
    const promptTemplate = await fs.readFile(promptPath, 'utf-8');

    // Define structured output schema
    const schema = {
      type: "object",
      properties: {
        meeting_summary: {
          type: "string",
          description: "A concise summary of the meeting with key discussion points"
        },
        adviser_actions: {
          type: "array",
          items: { type: "string" },
          description: "Action items assigned to the financial adviser"
        },
        client_actions: {
          type: "array",
          items: { type: "string" },
          description: "Action items assigned to the client"
        }
      },
      required: ["meeting_summary", "adviser_actions", "client_actions"],
      additionalProperties: false
    };

    // Call Claude API with structured outputs
    const message = await client.beta.messages.create({
      model: ANTHROPIC_CONFIG.MODEL,
      max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS.MEETING_SUMMARY,
      betas: ANTHROPIC_CONFIG.BETA_FEATURES,
      system: promptTemplate,  // Prompt as system message
      messages: [
        {
          role: 'user',
          content: transcription,  // Raw transcript as user message
        }
      ],
      output_format: {
        type: 'json_schema',
        schema: schema
      }
    });

    // Check stop reason
    if (message.stop_reason === 'refusal') {
      console.error('Claude refused to process the request');
      throw new Error(ERROR_MESSAGES.AI_SERVICE.REFUSAL);
    }

    if (message.stop_reason === 'max_tokens') {
      console.warn('Response truncated due to token limit');
      throw new Error(ERROR_MESSAGES.AI_SERVICE.TOKEN_LIMIT);
    }

    // Extract and parse JSON response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    if (!responseText) {
      throw new Error('Empty response from Claude API');
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
    }

    throw new Error('Failed to generate meeting summary');
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
  console.log('Generating discovery report with Claude API...');

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
      Object.entries(sections).map(async ([key, promptText]) => {
        const message = await client.messages.create({
          model: ANTHROPIC_CONFIG.MODEL,
          max_tokens: ANTHROPIC_CONFIG.MAX_TOKENS.DISCOVERY_REPORT,
          messages: [
            {
              role: 'user',
              content: promptText,
            },
          ],
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';

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
