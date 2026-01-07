// In-memory database service for meeting notes
// Data persists during server runtime but is lost on restart

import { MeetingNote } from '../types/index.js';

// In-memory storage matching frontend's Record<string, MeetingNote[]> structure
const meetingNotes: Map<string, MeetingNote[]> = new Map();

/**
 * Save a meeting note for a client
 * @param clientId - The client's ID
 * @param note - The meeting note to save
 * @returns The saved meeting note
 */
export function saveMeetingNote(clientId: string, note: MeetingNote): MeetingNote {
  const notes = meetingNotes.get(clientId) || [];

  // Add to beginning (most recent first)
  notes.unshift(note);

  meetingNotes.set(clientId, notes);

  console.log(`Saved meeting note ${note.id} for client ${clientId}`);

  return note;
}

/**
 * Get all meeting notes for a specific client
 * @param clientId - The client's ID
 * @returns Array of meeting notes (empty array if none exist)
 */
export function getMeetingNotes(clientId: string): MeetingNote[] {
  return meetingNotes.get(clientId) || [];
}

/**
 * Get all meeting notes for all clients
 * @returns Record of client IDs to their meeting notes
 */
export function getAllMeetingNotes(): Record<string, MeetingNote[]> {
  const result: Record<string, MeetingNote[]> = {};

  meetingNotes.forEach((notes, clientId) => {
    result[clientId] = notes;
  });

  return result;
}

/**
 * Delete a specific meeting note
 * @param clientId - The client's ID
 * @param meetingId - The meeting note ID to delete
 * @returns True if deleted, false if not found
 */
export function deleteMeetingNote(clientId: string, meetingId: string): boolean {
  const notes = meetingNotes.get(clientId);

  if (!notes) {
    return false;
  }

  const index = notes.findIndex(note => note.id === meetingId);

  if (index === -1) {
    return false;
  }

  notes.splice(index, 1);
  meetingNotes.set(clientId, notes);

  console.log(`Deleted meeting note ${meetingId} for client ${clientId}`);

  return true;
}
