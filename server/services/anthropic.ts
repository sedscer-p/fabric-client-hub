// Anthropic API service for meeting summarization and discovery report generation

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a meeting summary from a transcription using Claude
 * @param transcription - The meeting transcription text
 * @returns AI-generated summary (max 200 words)
 */
export async function generateSummary(transcription: string): Promise<string> {
  console.log('Generating meeting summary with Claude API...');

  try {
    // Load prompt template
    const promptPath = path.join(__dirname, '../../prompts/meeting-summary-prompt.txt');
    const promptTemplate = await fs.readFile(promptPath, 'utf-8');

    // Replace placeholder with actual transcription
    const prompt = promptTemplate.replace('{meeting_transacription}', transcription);

    // Call Claude API
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log(`Summary generated successfully (${summary.length} characters)`);

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
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
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 800,
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
