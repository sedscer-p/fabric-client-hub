import ffmpeg from 'fluent-ffmpeg';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Audio Chunking Service
 * Splits long audio files into 20-minute chunks for batch transcription
 */

const CHUNK_DURATION_SECONDS = 20 * 60; // 20 minutes
const TEMP_DIR = path.join(os.tmpdir(), 'fabric-audio-chunks');

interface AudioChunk {
  buffer: Buffer;
  index: number;
  startTime: number;
  endTime: number;
}

/**
 * Get audio duration in seconds
 */
export async function getAudioDuration(audioBuffer: Buffer, format: string): Promise<number> {
  const tempFile = path.join(os.tmpdir(), `temp-${randomUUID()}.${format}`);

  // Write buffer to temp file
  await fs.writeFile(tempFile, audioBuffer);

  // Get duration using ffprobe
  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(tempFile, async (err, metadata) => {
      // Clean up temp file before returning
      try {
        await fs.unlink(tempFile);
      } catch (unlinkError) {
        console.warn('Failed to delete temp file:', tempFile);
      }

      if (err) {
        reject(new Error(`Failed to get audio duration: ${err.message}`));
        return;
      }

      const duration = metadata.format.duration;
      if (!duration) {
        reject(new Error('Could not determine audio duration'));
        return;
      }

      resolve(duration);
    });
  });
}

/**
 * Split audio file into chunks
 */
export async function splitAudioIntoChunks(
  audioBuffer: Buffer,
  format: string,
  chunkDuration: number = CHUNK_DURATION_SECONDS
): Promise<AudioChunk[]> {
  const duration = await getAudioDuration(audioBuffer, format);
  const numChunks = Math.ceil(duration / chunkDuration);

  console.log(`📊 Audio duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`);
  console.log(`✂️  Splitting into ${numChunks} chunks of ${Math.floor(chunkDuration / 60)} minutes each`);

  // Ensure temp directory exists
  await fs.mkdir(TEMP_DIR, { recursive: true });

  const inputFile = path.join(TEMP_DIR, `input-${randomUUID()}.${format}`);
  await fs.writeFile(inputFile, audioBuffer);

  const chunks: AudioChunk[] = [];

  try {
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * chunkDuration;
      const endTime = Math.min((i + 1) * chunkDuration, duration);
      const outputFile = path.join(TEMP_DIR, `chunk-${i}-${randomUUID()}.${format}`);

      console.log(`🔪 Creating chunk ${i + 1}/${numChunks}: ${Math.floor(startTime / 60)}m - ${Math.floor(endTime / 60)}m`);

      // Extract chunk using ffmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputFile)
          .setStartTime(startTime)
          .setDuration(endTime - startTime)
          .output(outputFile)
          .audioCodec('libopus') // Re-encode to Opus for WebM compatibility
          .audioBitrate('128k')
          .format('webm')
          .on('end', () => resolve())
          .on('error', (err) => reject(new Error(`Failed to create chunk ${i}: ${err.message}`)))
          .run();
      });

      // Read chunk into buffer
      const chunkBuffer = await fs.readFile(outputFile);
      chunks.push({
        buffer: chunkBuffer,
        index: i,
        startTime,
        endTime,
      });

      // Clean up chunk file
      await fs.unlink(outputFile);
    }

    return chunks;
  } finally {
    // Clean up input file
    try {
      await fs.unlink(inputFile);
    } catch (error) {
      console.warn('Failed to delete input file:', inputFile);
    }
  }
}

/**
 * Check if audio file needs chunking
 */
export async function needsChunking(
  audioBuffer: Buffer,
  format: string,
  maxDuration: number = CHUNK_DURATION_SECONDS
): Promise<boolean> {
  const duration = await getAudioDuration(audioBuffer, format);
  return duration > maxDuration;
}
