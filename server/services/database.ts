// File-based database service for meeting notes
// Saves data to data_folder for persistence

import { MeetingNote } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root data folder path (relative to server root)
const DATA_FOLDER = path.join(__dirname, '../../data_folder');

/**
 * Convert client ID to folder name
 * Maps client IDs to safe, human-readable folder names
 */
function getClientFolderName(clientId: string): string {
  // Map known client IDs to folder names
  const clientFolderMap: Record<string, string> = {
    '1': 'sarah-mitchell',
    'client-123': 'sarah-mitchell',
  };

  // Return mapped name if it exists
  if (clientFolderMap[clientId]) {
    return clientFolderMap[clientId];
  }

  // Fallback for unknown clients - sanitize the ID
  return clientId.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Create a timestamped folder name for a meeting
 * Format: YYYYMMDD-HHMMSS-{meeting-type}
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
 * Save a meeting note for a client with all associated files
 * @param clientId - The client's ID
 * @param note - The meeting note to save
 * @param transcription - The meeting transcription text
 * @returns The saved meeting note
 */
export async function saveMeetingNote(
  clientId: string,
  note: MeetingNote,
  transcription: string
): Promise<MeetingNote> {
  const clientFolder = getClientFolderName(clientId);
  const meetingFolderName = createMeetingFolderName(note.date, note.type);
  const meetingFolder = path.join(DATA_FOLDER, clientFolder, meetingFolderName);

  // Create meeting folder and reports subfolder
  await ensureDirectory(meetingFolder);
  await ensureDirectory(path.join(meetingFolder, 'reports'));

  // Save transcription
  await fs.writeFile(
    path.join(meetingFolder, 'transcription.txt'),
    transcription,
    'utf-8'
  );

  // Save summary
  await fs.writeFile(
    path.join(meetingFolder, 'summary.txt'),
    note.summary,
    'utf-8'
  );

  // Save metadata as JSON
  const metadata = {
    id: note.id,
    date: note.date,
    type: note.type,
    hasAudio: note.hasAudio,
    folderPath: meetingFolder,
  };

  await fs.writeFile(
    path.join(meetingFolder, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );

  console.log(`Saved meeting note ${note.id} to ${meetingFolder}`);

  return note;
}

/**
 * Save a discovery report for a meeting
 * @param clientId - The client's ID
 * @param meetingId - The meeting ID
 * @param meetingDate - The meeting date
 * @param meetingType - The meeting type
 * @param report - The discovery report content
 */
export async function saveDiscoveryReport(
  clientId: string,
  meetingId: string,
  meetingDate: string,
  meetingType: string,
  report: string
): Promise<void> {
  const clientFolder = getClientFolderName(clientId);
  const meetingFolderName = createMeetingFolderName(meetingDate, meetingType);
  const reportsFolder = path.join(DATA_FOLDER, clientFolder, meetingFolderName, 'reports');

  // Ensure reports folder exists
  await ensureDirectory(reportsFolder);

  // Save discovery report
  await fs.writeFile(
    path.join(reportsFolder, 'discovery-report.txt'),
    report,
    'utf-8'
  );

  console.log(`Saved discovery report for meeting ${meetingId} to ${reportsFolder}`);
}

/**
 * Save actions from a meeting (placeholder for future implementation)
 * @param clientId - The client's ID
 * @param meetingId - The meeting ID
 * @param meetingDate - The meeting date
 * @param meetingType - The meeting type
 * @param actions - The actions data
 */
export async function saveMeetingActions(
  clientId: string,
  meetingId: string,
  meetingDate: string,
  meetingType: string,
  actions: any
): Promise<void> {
  const clientFolder = getClientFolderName(clientId);
  const meetingFolderName = createMeetingFolderName(meetingDate, meetingType);
  const meetingFolder = path.join(DATA_FOLDER, clientFolder, meetingFolderName);

  await ensureDirectory(meetingFolder);

  await fs.writeFile(
    path.join(meetingFolder, 'actions.json'),
    JSON.stringify(actions, null, 2),
    'utf-8'
  );

  console.log(`Saved actions for meeting ${meetingId}`);
}

/**
 * Get all meeting notes for a specific client (reads from filesystem)
 * @param clientId - The client's ID
 * @returns Array of meeting notes (empty array if none exist)
 */
export async function getMeetingNotes(clientId: string): Promise<MeetingNote[]> {
  const clientFolder = getClientFolderName(clientId);
  const clientPath = path.join(DATA_FOLDER, clientFolder);

  try {
    await fs.access(clientPath);
  } catch {
    return [];
  }

  const folders = await fs.readdir(clientPath);
  const notes: MeetingNote[] = [];

  for (const folder of folders) {
    const metadataPath = path.join(clientPath, folder, 'metadata.json');
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      const summaryPath = path.join(clientPath, folder, 'summary.txt');
      const transcriptionPath = path.join(clientPath, folder, 'transcription.txt');

      const summary = await fs.readFile(summaryPath, 'utf-8');
      const transcription = await fs.readFile(transcriptionPath, 'utf-8');

      notes.push({
        id: metadata.id,
        date: metadata.date,
        type: metadata.type,
        summary,
        transcription,
        hasAudio: metadata.hasAudio,
      });
    } catch (error) {
      console.warn(`Failed to read meeting folder ${folder}:`, error);
    }
  }

  // Sort by date (most recent first)
  notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return notes;
}

/**
 * Get all meeting notes for all clients
 * @returns Record of client IDs to their meeting notes
 */
export async function getAllMeetingNotes(): Promise<Record<string, MeetingNote[]>> {
  const result: Record<string, MeetingNote[]> = {};

  try {
    const clients = await fs.readdir(DATA_FOLDER);

    // Reverse mapping from folder names to client IDs
    const folderToClientMap: Record<string, string> = {
      'sarah-mitchell': '1',
    };

    for (const clientFolder of clients) {
      if (clientFolder === 'README.md' || clientFolder.startsWith('.')) {
        continue;
      }

      // Map folder name back to client ID
      const clientId = folderToClientMap[clientFolder] || clientFolder;

      result[clientId] = await getMeetingNotes(clientId);
    }
  } catch (error) {
    console.warn('Failed to read data folder:', error);
  }

  return result;
}

/**
 * Delete a specific meeting note
 * @param clientId - The client's ID
 * @param meetingId - The meeting note ID to delete
 * @returns True if deleted, false if not found
 */
export async function deleteMeetingNote(clientId: string, meetingId: string): Promise<boolean> {
  const notes = await getMeetingNotes(clientId);
  const note = notes.find(n => n.id === meetingId);

  if (!note) {
    return false;
  }

  const clientFolder = getClientFolderName(clientId);
  const meetingFolderName = createMeetingFolderName(note.date, note.type);
  const meetingFolder = path.join(DATA_FOLDER, clientFolder, meetingFolderName);

  try {
    await fs.rm(meetingFolder, { recursive: true, force: true });
    console.log(`Deleted meeting note ${meetingId} from ${meetingFolder}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete meeting folder ${meetingFolder}:`, error);
    return false;
  }
}
