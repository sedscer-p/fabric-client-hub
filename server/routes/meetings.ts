// API route handlers for meeting endpoints

import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ProcessMeetingRequest,
  ProcessMeetingResponse,
  SaveMeetingRequest,
  SaveMeetingResponse,
  DiscoveryReportRequest,
  DiscoveryReportResponse,
  MeetingNote,
} from '../types/index.js';
import { generateSummary, generateDiscoveryReport } from '../services/anthropic.js';
import { saveMeetingNote, saveDiscoveryReport } from '../services/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/meetings/process
 * Process a meeting recording and generate AI summary
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { clientId, meetingType, duration }: ProcessMeetingRequest = req.body;

    // Validate request
    if (!clientId || !meetingType) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields: clientId and meetingType',
      });
    }

    console.log(`Processing meeting for client ${clientId}, type: ${meetingType}`);

    // Load mock transcript
    const transcriptPath = path.join(__dirname, '../../prompts/mock_transcript.txt');
    const transcription = await fs.readFile(transcriptPath, 'utf-8');

    // Generate AI summary using Claude
    const summary = await generateSummary(transcription);

    // Generate unique meeting ID
    const meetingId = randomUUID();

    const response: ProcessMeetingResponse = {
      transcription,
      summary,
      meetingId,
    };

    console.log(`Meeting processed successfully. Meeting ID: ${meetingId}`);

    res.json(response);
  } catch (error: any) {
    console.error('Error processing meeting:', error);

    // Handle specific error types
    if (error.message.includes('Failed to generate')) {
      return res.status(502).json({
        error: 'AI service error',
        message: 'Failed to generate meeting summary. Please try again.',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the meeting',
    });
  }
});

/**
 * POST /api/meetings/save
 * Save an accepted meeting note to the database
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      meetingId,
      meetingType,
      summary,
      transcription,
      date,
      hasAudio,
    }: SaveMeetingRequest = req.body;

    // Validate request
    if (!clientId || !meetingId || !meetingType || !summary || !transcription || !date) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields',
      });
    }

    console.log(`Saving meeting note ${meetingId} for client ${clientId}`);

    // Create meeting note object
    const meetingNote: MeetingNote = {
      id: meetingId,
      date,
      type: meetingType,
      summary,
      transcription,
      hasAudio: hasAudio ?? true,
    };

    // Save to database with transcription
    const savedNote = await saveMeetingNote(clientId, meetingNote, transcription);

    const response: SaveMeetingResponse = {
      success: true,
      meetingNote: savedNote,
    };

    console.log(`Meeting note saved successfully`);

    res.json(response);
  } catch (error: any) {
    console.error('Error saving meeting note:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while saving the meeting note',
    });
  }
});

/**
 * POST /api/meetings/discovery-report
 * Generate a discovery report from a meeting transcription
 */
router.post('/discovery-report', async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      meetingId,
      transcription,
      meetingDate,
      meetingType,
    }: DiscoveryReportRequest & { meetingDate: string; meetingType: string } = req.body;

    // Validate request
    if (!clientId || !meetingId || !transcription || !meetingDate || !meetingType) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields: clientId, meetingId, transcription, meetingDate, and meetingType',
      });
    }

    console.log(`Generating discovery report for meeting ${meetingId}`);

    // Generate discovery report using Claude
    const report = await generateDiscoveryReport(transcription);

    // Save discovery report to data folder
    await saveDiscoveryReport(clientId, meetingId, meetingDate, meetingType, report);

    const response: DiscoveryReportResponse = {
      success: true,
      report,
    };

    console.log(`Discovery report generated and saved successfully`);

    res.json(response);
  } catch (error: any) {
    console.error('Error generating discovery report:', error);

    // Handle specific error types
    if (error.message.includes('Failed to generate')) {
      return res.status(502).json({
        error: 'AI service error',
        message: 'Failed to generate discovery report. Please try again.',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while generating the discovery report',
    });
  }
});

export default router;
