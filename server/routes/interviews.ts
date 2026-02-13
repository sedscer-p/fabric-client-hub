// API route handlers for interview/transcription endpoints

import express, { Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { transcribeAudio, formatSpeakerTranscript, getSupportedAudioFormats } from '../services/transcription.js';

// Extend Express Request type to include Multer file
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

const router = express.Router();

// Configure multer for audio file uploads (store in memory for now)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const supportedFormats = getSupportedAudioFormats();
    const fileExt = file.originalname.split('.').pop()?.toLowerCase() || '';

    if (supportedFormats.includes(fileExt as any)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format. Supported formats: ${supportedFormats.join(', ')}`));
    }
  },
});

/**
 * POST /api/interviews/transcribe
 * Transcribe audio file using Google Cloud Speech-to-Text V2 (Chirp 3)
 *
 * Expects multipart/form-data with:
 * - audio: audio file (mp3, m4a, wav, webm, ogg, flac)
 */
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'Missing audio file',
        message: 'Please upload an audio file',
      });
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_SPEECH_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_SPEECH_API_KEY not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Speech-to-Text API is not configured. Please set GOOGLE_SPEECH_API_KEY in environment variables.',
      });
    }

    const audioBuffer = req.file.buffer;
    const audioFormat = req.file.originalname.split('.').pop()?.toLowerCase() || 'mp3';

    console.log(`Transcribing audio file: ${req.file.originalname} (${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB)`);

    // Transcribe audio with speaker diarization
    const result = await transcribeAudio(audioBuffer, audioFormat, apiKey);

    console.log(`Transcription complete: ${result.duration_seconds.toFixed(2)}s, ${result.speakers.length} speaker segments`);

    // Format response
    const formattedTranscript = formatSpeakerTranscript(result.speakers);

    res.json({
      success: true,
      data: {
        transcript: result.transcript,
        formatted_transcript: formattedTranscript,
        speakers: result.speakers,
        duration_seconds: result.duration_seconds,
        language_code: result.language_code,
        speaker_count: new Set(result.speakers.map(s => s.speaker)).size,
      },
    });
  } catch (error: any) {
    console.error('Transcription error:', error);

    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'Invalid or missing API key',
      });
    }

    if (error.message.includes('file size')) {
      return res.status(413).json({
        error: 'File too large',
        message: error.message,
      });
    }

    if (error.message.includes('Unsupported')) {
      return res.status(400).json({
        error: 'Invalid format',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message || 'An unexpected error occurred during transcription',
    });
  }
});

/**
 * GET /api/interviews/supported-formats
 * Get list of supported audio formats
 */
router.get('/supported-formats', (req: Request, res: Response) => {
  const formats = getSupportedAudioFormats();

  res.json({
    success: true,
    formats: formats,
    max_file_size_mb: 25,
  });
});

export default router;
