export const MEETING_SUMMARY_PROMPT = `<objective>
You are a meeting note summariser. You will get a transcript and you will then need to generate a summary of what occurred during the meeting
</objective>

<transcription>
{meeting_transcription}
</transcription>

<rules>
- Summary should be no more than 200 words
</rules>`;

export function buildPrompt(transcription: string): string {
  return MEETING_SUMMARY_PROMPT.replace('{meeting_transcription}', transcription);
}
