import { SpeechClient } from '@google-cloud/speech/build/src/v2';
import { Storage } from '@google-cloud/storage';
import { SPEECH_CONFIG } from '../config/constants';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { needsChunking, splitAudioIntoChunks } from './audio-chunker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Google Cloud Speech-to-Text V2 Transcription Service
 * Handles audio transcription with Chirp 3 model and speaker diarization
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

// Initialize Speech V2 client with service account credentials and regional endpoint
const credentialsPath = path.join(__dirname, '../../google-credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const projectId = credentials.project_id;

// Use v2 client for Chirp 3
const speechClient = new SpeechClient({
  keyFilename: credentialsPath,
  apiEndpoint: 'us-speech.googleapis.com', // Regional endpoint required for Chirp 3
});

// Initialize Google Cloud Storage for batch recognition
const storage = new Storage({
  keyFilename: credentialsPath,
});

// GCS bucket for temporary audio storage (manually created in GCS Console)
const BUCKET_NAME = 'fabric-meeting';

/**
 * Transcribe audio using Google Cloud Speech-to-Text V2
 * Automatically handles chunking for long files (>20 min), sync/batch for shorter files
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  audioFormat: string
): Promise<TranscriptionResult> {

  // Validate audio format
  if (!SPEECH_CONFIG.SUPPORTED_FORMATS.includes(audioFormat as any)) {
    throw new Error(
      `Unsupported audio format: ${audioFormat}. Supported formats: ${SPEECH_CONFIG.SUPPORTED_FORMATS.join(', ')}`
    );
  }

  try {
    const fileSizeMB = audioBuffer.length / 1024 / 1024;

    // Only check duration for very large files (>30MB, likely >20 minutes)
    // This avoids unnecessary ffprobe calls for smaller files
    if (fileSizeMB > 30) {
      const needsSplitting = await needsChunking(audioBuffer, audioFormat, 20 * 60);

      if (needsSplitting) {
        console.log(`🎬 File exceeds 20 minutes - using chunked transcription`);
        return await transcribeWithChunking(audioBuffer, audioFormat);
      }
    }

    // For files under 30MB, use size-based logic (fast)
    const useBatchRecognition = fileSizeMB > 10;

    if (useBatchRecognition) {
      console.log(`🔄 Using batch recognition for large file (${fileSizeMB.toFixed(2)}MB)`);
      return await transcribeAudioBatch(audioBuffer);
    } else {
      console.log(`⚡ Using synchronous recognition for small file (${fileSizeMB.toFixed(2)}MB)`);
      return await transcribeAudioSync(audioBuffer);
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(
      `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Transcribe long audio files by splitting into chunks and processing asynchronously
 */
async function transcribeWithChunking(
  audioBuffer: Buffer,
  audioFormat: string
): Promise<TranscriptionResult> {
  console.log('✂️  Splitting audio into 20-minute chunks...');

  // Split audio into chunks
  const chunks = await splitAudioIntoChunks(audioBuffer, audioFormat, 20 * 60);

  console.log(`🚀 Transcribing ${chunks.length} chunks in parallel...`);

  // Transcribe all chunks in parallel
  const chunkResults = await Promise.all(
    chunks.map(async (chunk) => {
      console.log(`🎙️  Transcribing chunk ${chunk.index + 1}/${chunks.length} (${Math.floor(chunk.startTime / 60)}m - ${Math.floor(chunk.endTime / 60)}m)`);
      return await transcribeAudioBatch(chunk.buffer);
    })
  );

  console.log('🔗 Combining chunk transcripts...');

  // Combine results
  let fullTranscript = '';
  const allSpeakers: SpeakerSegment[] = [];
  let totalDuration = 0;

  for (let i = 0; i < chunkResults.length; i++) {
    const result = chunkResults[i];
    const chunk = chunks[i];

    fullTranscript += (i > 0 ? ' ' : '') + result.transcript;

    // Adjust timestamps for speaker segments based on chunk start time
    const adjustedSegments = result.speakers.map(seg => ({
      ...seg,
      start_time: seg.start_time + chunk.startTime,
      end_time: seg.end_time + chunk.startTime,
    }));

    allSpeakers.push(...adjustedSegments);
    totalDuration = Math.max(totalDuration, chunk.endTime);
  }

  console.log(`✅ Combined ${chunks.length} chunks into single transcript (${Math.floor(totalDuration / 60)}m ${Math.floor(totalDuration % 60)}s)`);

  return {
    transcript: fullTranscript,
    speakers: allSpeakers,
    duration_seconds: totalDuration,
    language_code: SPEECH_CONFIG.LANGUAGE_CODE,
  };
}

/**
 * Synchronous transcription for short audio (<1 minute)
 */
async function transcribeAudioSync(audioBuffer: Buffer): Promise<TranscriptionResult> {
  const request: any = {
    recognizer: `projects/${projectId}/locations/us/recognizers/_`,
    config: {
      autoDecodingConfig: {},
      languageCodes: [SPEECH_CONFIG.LANGUAGE_CODE],
      model: 'chirp_3',
      features: {
        enableAutomaticPunctuation: SPEECH_CONFIG.FEATURES.ENABLE_AUTOMATIC_PUNCTUATION,
        enableWordTimeOffsets: SPEECH_CONFIG.FEATURES.ENABLE_WORD_TIME_OFFSETS,
        profanityFilter: SPEECH_CONFIG.FEATURES.PROFANITY_FILTER,
        diarizationConfig: {
          enableSpeakerDiarization: SPEECH_CONFIG.DIARIZATION.ENABLED,
          minSpeakerCount: SPEECH_CONFIG.DIARIZATION.MIN_SPEAKERS,
          maxSpeakerCount: SPEECH_CONFIG.DIARIZATION.MAX_SPEAKERS,
        },
      },
    },
    content: audioBuffer,
  };

  const [response] = await speechClient.recognize(request);
  return parseTranscriptionResponse(response);
}

/**
 * Batch transcription for long audio (30-60 minutes, up to 8 hours)
 * Uploads to GCS first, then uses long-running batch recognition
 */
async function transcribeAudioBatch(audioBuffer: Buffer): Promise<TranscriptionResult> {
  console.log('🎯 Starting batch recognition for long interview...');

  // Step 1: Upload audio to GCS
  const fileName = `interview-${randomUUID()}.webm`;
  const gcsUri = await uploadToGCS(audioBuffer, fileName);

  console.log(`📤 Uploaded to GCS: ${gcsUri}`);

  // Step 2: Start batch recognition with GCS file
  const request: any = {
    recognizer: `projects/${projectId}/locations/us/recognizers/_`,
    config: {
      autoDecodingConfig: {},
      languageCodes: [SPEECH_CONFIG.LANGUAGE_CODE],
      model: 'chirp_3',
      features: {
        enableAutomaticPunctuation: SPEECH_CONFIG.FEATURES.ENABLE_AUTOMATIC_PUNCTUATION,
        enableWordTimeOffsets: SPEECH_CONFIG.FEATURES.ENABLE_WORD_TIME_OFFSETS,
        profanityFilter: SPEECH_CONFIG.FEATURES.PROFANITY_FILTER,
        diarizationConfig: {
          enableSpeakerDiarization: SPEECH_CONFIG.DIARIZATION.ENABLED,
          minSpeakerCount: SPEECH_CONFIG.DIARIZATION.MIN_SPEAKERS,
          maxSpeakerCount: SPEECH_CONFIG.DIARIZATION.MAX_SPEAKERS,
        },
      },
    },
    files: [{ uri: gcsUri }],
    recognitionOutputConfig: {
      inlineResponseConfig: {},
    },
  };

  // Start long-running batch recognition operation
  const [operation] = await speechClient.batchRecognize(request);

  console.log('⏳ Batch job started, waiting for completion (this may take a few minutes)...');

  // Wait for the operation to complete (automatically polls)
  const [response] = await operation.promise();

  console.log('✅ Batch recognition completed successfully!');

  // Step 3: Clean up - delete from GCS
  try {
    await storage.bucket(BUCKET_NAME).file(fileName).delete();
    console.log(`🗑️  Cleaned up temporary file from GCS`);
  } catch (error) {
    console.warn('Failed to delete temporary GCS file:', error);
  }

  return parseTranscriptionResponse(response);
}

/**
 * Upload audio buffer to Google Cloud Storage
 */
async function uploadToGCS(audioBuffer: Buffer, fileName: string): Promise<string> {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(fileName);

  // Upload buffer to GCS
  await file.save(audioBuffer, {
    metadata: {
      contentType: 'audio/webm',
    },
  });

  return `gs://${BUCKET_NAME}/${fileName}`;
}

/**
 * Parse Speech-to-Text API response and extract speaker segments
 */
function parseTranscriptionResponse(apiResponse: any): TranscriptionResult {
  // Batch recognition response structure is different from sync
  // Batch: { results: { <uri>: { transcript: { results: [...] }, metadata: { totalBilledDuration: ... } } } }
  // Sync: { results: [...] }

  let results: any[] = [];
  let actualDuration: number | null = null;

  // Handle batch recognition response format
  if (apiResponse.results && typeof apiResponse.results === 'object' && !Array.isArray(apiResponse.results)) {
    // Batch format: results is an object with URIs as keys
    const batchResults = Object.values(apiResponse.results)[0] as any;
    if (batchResults?.transcript?.results) {
      results = batchResults.transcript.results;
    }
    // Get actual audio duration from metadata
    if (batchResults?.metadata?.totalBilledDuration) {
      actualDuration = parseTime(batchResults.metadata.totalBilledDuration);
    }
  } else {
    // Synchronous format: results is an array
    results = apiResponse.results || [];
  }

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
    duration_seconds: actualDuration !== null ? actualDuration : totalDuration,
    language_code: SPEECH_CONFIG.LANGUAGE_CODE,
  };
}

/**
 * Parse time value - handles both string ("1.234s") and object ({ seconds: "300", nanos: 0 })
 */
function parseTime(time: any): number {
  if (!time) return 0;

  // Handle object format: { seconds: "300", nanos: 0 }
  if (typeof time === 'object' && time.seconds !== undefined) {
    const seconds = parseFloat(time.seconds || '0');
    const nanos = parseFloat(time.nanos || '0');
    return seconds + nanos / 1000000000;
  }

  // Handle string format: "1.234s"
  if (typeof time === 'string') {
    return parseFloat(time.replace('s', ''));
  }

  return 0;
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
