// File storage service for saving action items to JSON files

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { ActionItem, ActionItemsFile } from '../types/index.js';
import { STORAGE_CONFIG, ERROR_MESSAGES } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Save action items to JSON file in /src/data folder
 * Overwrites previous file for same clientId (as per requirements)
 *
 * @param clientId - Client identifier
 * @param meetingId - Meeting identifier
 * @param meetingDate - ISO date string
 * @param actions - Array of action strings
 * @param type - 'client' or 'adviser'
 */
export async function saveActionItems(
  clientId: string,
  meetingId: string,
  meetingDate: string,
  actions: string[],
  type: 'client' | 'adviser'
): Promise<void> {
  try {
    // Construct file path using constants
    const dataDir = path.join(__dirname, '../../', STORAGE_CONFIG.DATA_DIRECTORY);
    const filename = type === 'client'
      ? STORAGE_CONFIG.FILE_NAMES.CLIENT_ACTIONS(clientId)
      : STORAGE_CONFIG.FILE_NAMES.ADVISER_ACTIONS(clientId);
    const filePath = path.join(dataDir, filename);

    // Transform string actions into ActionItem objects
    const actionItems: ActionItem[] = actions.map((text) => ({
      id: randomUUID(),
      text,
      status: 'pending' as const,
      fromMeetingDate: meetingDate,
      meetingId,
    }));

    // Create file content
    const fileContent: ActionItemsFile = {
      clientId,
      meetingId,
      meetingDate,
      actions: actionItems,
    };

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Write JSON file (overwrites if exists)
    await fs.writeFile(
      filePath,
      JSON.stringify(fileContent, null, STORAGE_CONFIG.JSON_INDENT),
      'utf-8'
    );

    console.log(
      `Saved ${actions.length} ${type} actions for client ${clientId} to ${filename}`
    );

  } catch (error) {
    console.error(`Error saving ${type} action items:`, error);
    throw new Error(ERROR_MESSAGES.FILE_STORAGE.SAVE_FAILED);
  }
}

/**
 * Save both client and adviser actions from meeting summary
 *
 * @param clientId - Client identifier
 * @param meetingId - Meeting identifier
 * @param meetingDate - ISO date string
 * @param clientActions - Array of client action strings
 * @param adviserActions - Array of adviser action strings
 */
export async function saveMeetingActions(
  clientId: string,
  meetingId: string,
  meetingDate: string,
  clientActions: string[],
  adviserActions: string[]
): Promise<void> {
  // Save both files in parallel
  await Promise.all([
    saveActionItems(clientId, meetingId, meetingDate, clientActions, 'client'),
    saveActionItems(clientId, meetingId, meetingDate, adviserActions, 'adviser'),
  ]);
}
