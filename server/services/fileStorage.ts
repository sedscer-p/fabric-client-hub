// File storage service for saving action items to JSON files in data_folder

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { ActionItem, ActionItemsFile } from '../types/index.js';
import { STORAGE_CONFIG, ERROR_MESSAGES } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root data folder path (relative to server root)
const DATA_FOLDER = path.join(__dirname, '../../', STORAGE_CONFIG.DATA_FOLDER);

/**
 * Convert client ID to folder name
 * Maps client IDs to safe, human-readable folder names
 * Shared logic with database.ts
 */
function getClientFolderName(clientId: string): string {
  // Return mapped name if it exists
  if (STORAGE_CONFIG.CLIENT_FOLDER_MAP[clientId]) {
    return STORAGE_CONFIG.CLIENT_FOLDER_MAP[clientId];
  }

  // Fallback for unknown clients - sanitize the ID
  return clientId.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Create a timestamped folder name for a meeting
 * Format: YYYYMMDD-HHMMSS-{meeting-type}
 * Shared logic with database.ts
 */
function createMeetingFolderName(date: string, meetingType: string): string {
  const d = new Date(date);
  const timestamp = d.toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '-')
    .replace(/\.\d+Z$/, '');

  const typeSlug = meetingType.toLowerCase().replace(/\s+/g, '-');

  return `${timestamp.substring(0, 15)}-${typeSlug}`;
}

/**
 * Ensure a directory exists
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Save action items to JSON file in data_folder structure
 * Structure: data_folder/{clientFolder}/{meetingFolder}/{action-file}.json
 *
 * @param clientId - Client identifier
 * @param meetingId - Meeting identifier
 * @param meetingDate - ISO date string
 * @param meetingType - Meeting type (discovery, regular, annual)
 * @param actions - Array of action strings
 * @param type - 'client' or 'adviser'
 */
export async function saveActionItems(
  clientId: string,
  meetingId: string,
  meetingDate: string,
  meetingType: string,
  actions: string[],
  type: 'client' | 'adviser'
): Promise<void> {
  try {
    // Construct folder path matching database.ts structure
    const clientFolder = getClientFolderName(clientId);
    const meetingFolderName = createMeetingFolderName(meetingDate, meetingType);
    const meetingFolder = path.join(DATA_FOLDER, clientFolder, meetingFolderName);

    // Get filename from constants
    const filename = type === 'client'
      ? STORAGE_CONFIG.FILE_NAMES.CLIENT_ACTIONS
      : STORAGE_CONFIG.FILE_NAMES.ADVISER_ACTIONS;

    const filePath = path.join(meetingFolder, filename);

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

    // Ensure meeting folder exists
    await ensureDirectory(meetingFolder);

    // Write JSON file
    await fs.writeFile(
      filePath,
      JSON.stringify(fileContent, null, STORAGE_CONFIG.JSON_INDENT),
      'utf-8'
    );

    console.log(
      `Saved ${actions.length} ${type} actions to ${clientFolder}/${meetingFolderName}/${filename}`
    );

  } catch (error) {
    console.error(`Error saving ${type} action items:`, error);
    throw new Error(ERROR_MESSAGES.FILE_STORAGE.SAVE_FAILED);
  }
}

/**
 * Save both client and adviser actions from meeting summary
 * Actions are saved to: data_folder/{clientFolder}/{meetingFolder}/
 *
 * @param clientId - Client identifier
 * @param meetingId - Meeting identifier
 * @param meetingDate - ISO date string
 * @param meetingType - Meeting type (discovery, regular, annual)
 * @param clientActions - Array of client action strings
 * @param adviserActions - Array of adviser action strings
 */
export async function saveMeetingActions(
  clientId: string,
  meetingId: string,
  meetingDate: string,
  meetingType: string,
  clientActions: string[],
  adviserActions: string[]
): Promise<void> {
  // Save both files in parallel to the same meeting folder
  await Promise.all([
    saveActionItems(clientId, meetingId, meetingDate, meetingType, clientActions, 'client'),
    saveActionItems(clientId, meetingId, meetingDate, meetingType, adviserActions, 'adviser'),
  ]);
}
