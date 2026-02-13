import { SPEECH_CONFIG } from '../config/constants';

/**
 * Google Cloud Speech-to-Text V2 Transcription Service
 * Handles audio transcription with speaker diarization using Chirp 3 model
 */

interface TranscriptionResult {
  transcript: string;
  speakers: SpeakerSegment[];
  duration_seconds: number;
  language_code: string;
}

interface SpeakerSegment {
  speaker: number;
  text: string;
  start_time: number;
  end_time: number;
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text V2 with Chirp 3 model
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  audioFormat: string,
  apiKey: string
): Promise<TranscriptionResult> {
  if (!apiKey) {
    throw new Error('Google Speech API key is required');
  }

  // Validate file size
  if (audioBuffer.length > SPEECH_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Audio file size (${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${SPEECH_CONFIG.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`
    );
  }

  // Validate audio format
  if (!SPEECH_CONFIG.SUPPORTED_FORMATS.includes(audioFormat as any)) {
    throw new Error(
      `Unsupported audio format: ${audioFormat}. Supported formats: ${SPEECH_CONFIG.SUPPORTED_FORMATS.join(', ')}`
    );
  }

  try {
    // Convert audio buffer to base64
    const audioContent = audioBuffer.toString('base64');

    // Map common format names to Speech API encoding types
    const encodingMap: Record<string, string> = {
      mp3: 'MP3',
      m4a: 'MP3',
      wav: 'LINEAR16',
      webm: 'WEBM_OPUS',
      ogg: 'OGG_OPUS',
      flac: 'FLAC',
    };

    const encoding = encodingMap[audioFormat.toLowerCase()] || 'MP3';

    // Build the Speech-to-Text V2 API request
    const requestBody = {
      config: {
        model: SPEECH_CONFIG.MODEL,
        languageCode: SPEECH_CONFIG.LANGUAGE_CODE,
        encoding: encoding,
        enableAutomaticPunctuation: SPEECH_CONFIG.FEATURES.ENABLE_AUTOMATIC_PUNCTUATION,
        enableWordTimeOffsets: SPEECH_CONFIG.FEATURES.ENABLE_WORD_TIME_OFFSETS,
        profanityFilter: SPEECH_CONFIG.FEATURES.PROFANITY_FILTER,
        diarizationConfig: {
          enableSpeakerDiarization: SPEECH_CONFIG.DIARIZATION.ENABLED,
          minSpeakerCount: SPEECH_CONFIG.DIARIZATION.MIN_SPEAKERS,
          maxSpeakerCount: SPEECH_CONFIG.DIARIZATION.MAX_SPEAKERS,
        },
      },
      audio: {
        content: audioContent,
      },
    };

    // Make API call to Google Cloud Speech-to-Text V2
    const response = await fetch(
      `${SPEECH_CONFIG.API_ENDPOINT}:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Speech API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Parse the response and extract speaker-diarized transcript
    const result = parseTranscriptionResponse(data);

    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(
      `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse Speech-to-Text API response and extract speaker segments
 */
function parseTranscriptionResponse(apiResponse: any): TranscriptionResult {
  const results = apiResponse.results || [];

  if (results.length === 0) {
    throw new Error('No transcription results returned from Speech API');
  }

  // Combine all transcript alternatives (use the first/best one)
  let fullTranscript = '';
  const speakerSegments: SpeakerSegment[] = [];
  let totalDuration = 0;

  for (const result of results) {
    const alternative = result.alternatives?.[0];
    if (!alternative) continue;

    fullTranscript += alternative.transcript + ' ';

    // Extract speaker diarization info if available
    if (alternative.words) {
      let currentSpeaker: number | null = null;
      let currentText = '';
      let segmentStart = 0;

      for (const word of alternative.words) {
        const speakerTag = word.speakerTag || word.speakerLabel || 0;
        const startTime = parseTime(word.startTime || word.startOffset);
        const endTime = parseTime(word.endTime || word.endOffset);

        totalDuration = Math.max(totalDuration, endTime);

        // If speaker changed, save previous segment
        if (currentSpeaker !== null && currentSpeaker !== speakerTag) {
          speakerSegments.push({
            speaker: currentSpeaker,
            text: currentText.trim(),
            start_time: segmentStart,
            end_time: startTime,
          });
          currentText = '';
          segmentStart = startTime;
        }

        currentSpeaker = speakerTag;
        currentText += word.word + ' ';
      }

      // Save the last segment
      if (currentSpeaker !== null && currentText.trim()) {
        speakerSegments.push({
          speaker: currentSpeaker,
          text: currentText.trim(),
          start_time: segmentStart,
          end_time: totalDuration,
        });
      }
    }
  }

  return {
    transcript: fullTranscript.trim(),
    speakers: speakerSegments,
    duration_seconds: totalDuration,
    language_code: SPEECH_CONFIG.LANGUAGE_CODE,
  };
}

/**
 * Parse time string (e.g., "1.234s") to seconds as number
 */
function parseTime(timeStr: string | undefined): number {
  if (!timeStr) return 0;
  return parseFloat(timeStr.replace('s', ''));
}

/**
 * Format speaker segments into a readable transcript
 */
export function formatSpeakerTranscript(segments: SpeakerSegment[]): string {
  let formatted = '';

  for (const segment of segments) {
    formatted += `Speaker ${segment.speaker}: ${segment.text}\n\n`;
  }

  return formatted.trim();
}

/**
 * Get supported audio file extensions
 */
export function getSupportedAudioFormats(): readonly string[] {
  return SPEECH_CONFIG.SUPPORTED_FORMATS;
}
