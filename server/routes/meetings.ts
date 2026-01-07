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
import { saveMeetingNote, saveDiscoveryReport, getAllMeetingNotes, getMeetingNotes } from '../services/database.js';
import { saveMeetingActions } from '../services/fileStorage.js';
import { ERROR_MESSAGES, PROMPTS_CONFIG } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/meetings
 * Get all meeting notes for all clients
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Fetching all meeting notes');
    const allMeetingNotes = await getAllMeetingNotes();

    res.json({
      success: true,
      meetingNotes: allMeetingNotes,
    });
  } catch (error: any) {
    console.error('Error fetching meeting notes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching meeting notes',
    });
  }
});

/**
 * GET /api/meetings/:clientId
 * Get all meeting notes for a specific client
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    console.log(`Fetching meeting notes for client ${clientId}`);

    const notes = await getMeetingNotes(clientId);

    res.json({
      success: true,
      meetingNotes: notes,
    });
  } catch (error: any) {
    console.error('Error fetching meeting notes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching meeting notes',
    });
  }
});

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
        message: ERROR_MESSAGES.VALIDATION.MISSING_FIELDS + ': clientId and meetingType',
      });
    }

    console.log(`Processing meeting for client ${clientId}, type: ${meetingType}`);

    // Load mock transcript
    const transcriptPath = path.join(__dirname, '../../', PROMPTS_CONFIG.MOCK_TRANSCRIPT);
    const transcription = await fs.readFile(transcriptPath, 'utf-8');

    // Generate AI summary with structured outputs
    const structuredOutput = await generateSummary(transcription);

    // Generate unique meeting ID and date
    const meetingId = randomUUID();
    const meetingDate = new Date().toISOString();

    // Save action items to JSON files in data_folder structure
    try {
      await saveMeetingActions(
        clientId,
        meetingId,
        meetingDate,
        meetingType,
        structuredOutput.client_actions,
        structuredOutput.adviser_actions
      );
    } catch (fileError) {
      // Log error but don't fail the request
      console.error('Failed to save action items to files:', fileError);
      // Continue - the summary is still valid
    }

    // Build response (backward compatible)
    const response: ProcessMeetingResponse = {
      transcription,
      summary: structuredOutput.meeting_summary,  // Extract for compatibility
      meetingId,
      structuredData: structuredOutput,  // Include full structured data
    };

    console.log(`Meeting processed successfully. Meeting ID: ${meetingId}`);

    res.json(response);
  } catch (error: any) {
    console.error('Error processing meeting:', error);

    // Handle specific error types
    if (error.message.includes('Failed to generate')) {
      return res.status(502).json({
        error: 'AI service error',
        message: ERROR_MESSAGES.AI_SERVICE.GENERATION_FAILED,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
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
        message: ERROR_MESSAGES.VALIDATION.MISSING_FIELDS,
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
      message: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
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
        message: ERROR_MESSAGES.VALIDATION.MISSING_FIELDS + ': clientId, meetingId, transcription, meetingDate, and meetingType',
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
        message: ERROR_MESSAGES.AI_SERVICE.REPORT_FAILED,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
    });
  }
});

export default router;
