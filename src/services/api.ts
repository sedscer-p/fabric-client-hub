const API_BASE = 'http://localhost:3001';

// Type definitions for API requests and responses

export interface ProcessMeetingRequest {
  clientId: string;
  meetingType: string;
  duration: number;
}

export interface ProcessMeetingResponse {
  transcription: string;
  summary: string;
  meetingId: string;
}

export interface SaveMeetingRequest {
  clientId: string;
  meetingId: string;
  meetingType: string;
  summary: string;
  transcription: string;
  date: string;
  hasAudio: boolean;
}

export interface SaveMeetingResponse {
  success: boolean;
  meetingNote: {
    id: string;
    date: string;
    type: string;
    summary: string;
    transcription: string;
    hasAudio: boolean;
  };
}

export interface DiscoveryReportRequest {
  clientId: string;
  meetingId: string;
  transcription: string;
}

export interface DiscoveryReportResponse {
  success: boolean;
  report: {
    riskTolerance: string;
    factFind: string;
    capacityForLoss: string;
    financialObjectives: string;
  };
}

// API Functions

/**
 * Process a meeting recording and generate AI summary
 */
export async function processMeeting(
  request: ProcessMeetingRequest
): Promise<ProcessMeetingResponse> {
  const response = await fetch(`${API_BASE}/api/meetings/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Save an accepted meeting note to the database
 */
export async function saveMeetingNote(
  request: SaveMeetingRequest
): Promise<SaveMeetingResponse> {
  const response = await fetch(`${API_BASE}/api/meetings/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate a discovery report from meeting transcription
 */
export async function generateDiscoveryReport(
  request: DiscoveryReportRequest
): Promise<DiscoveryReportResponse> {
  const response = await fetch(`${API_BASE}/api/meetings/discovery-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * @deprecated Use processMeeting instead
 */
export async function summarizeMeeting(transcription: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcription }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.summary;
}
