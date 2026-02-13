const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions for API requests and responses

export interface ProcessMeetingRequest {
  clientId: string;
  meetingType: string;
  transcriptFile: string;
  duration: number;
}

export interface ActionItem {
  id: string;
  text: string;
  status: 'pending' | 'complete';
  dueDate?: string;
}

export interface ProcessMeetingResponse {
  transcription: string;
  summary: string;
  meetingId: string;
  structuredData?: {
    meeting_summary: string;
    adviser_actions: string[];
    client_actions: string[];
  };
}

export interface SaveMeetingRequest {
  clientId: string;
  meetingId: string;
  meetingType: string;
  summary: string;
  transcription: string;
  date: string;
  hasAudio: boolean;
  clientActions?: ActionItem[];
  advisorActions?: ActionItem[];
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
  meetingDate: string;
  meetingType: string;
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

export interface DocumentGenerationRequest {
  clientId: string;
  meetingId: string;
  documentType: string;
  transcription: string;
  meetingDate: string;
  meetingType: string;
}

export interface DocumentGenerationResponse {
  success: boolean;
  document: string;
}

export interface SaveDocumentRequest {
  clientId: string;
  meetingId: string;
  documentType: string;
  content: string;
  meetingDate: string;
  meetingType: string;
}

export interface MeetingNote {
  id: string;
  date: string;
  type: string;
  summary: string;
  transcription: string;
  hasAudio: boolean;
  clientActions?: ActionItem[];
  advisorActions?: ActionItem[];
  reports?: { type: string; content: string }[];
}

export interface GetAllMeetingsResponse {
  success: boolean;
  meetingNotes: Record<string, MeetingNote[]>;
}

export interface GetClientMeetingsResponse {
  success: boolean;
  meetingNotes: MeetingNote[];
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
 * Get all meeting notes for all clients
 */
export async function getAllMeetings(): Promise<GetAllMeetingsResponse> {
  const response = await fetch(`${API_BASE}/api/meetings`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get all meeting notes for a specific client
 */
export async function getClientMeetings(clientId: string): Promise<GetClientMeetingsResponse> {
  const response = await fetch(`${API_BASE}/api/meetings/${clientId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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
 * Generate a custom document from meeting transcription using a template
 */
export async function generateDocument(
  request: DocumentGenerationRequest
): Promise<DocumentGenerationResponse> {
  const response = await fetch(`${API_BASE}/api/meetings/generate-document`, {
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
 * Save a generated document to the data folder
 */
export async function saveDocument(request: SaveDocumentRequest): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/api/meetings/save-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Send meeting summary email to client
 */
export interface SendEmailRequest {
  clientId: string;
  meetingId: string;
  recipientEmail: string;
  clientName: string;
  advisorName: string;
  includeTranscription?: boolean;
  includeReport?: boolean;
}

export interface SendEmailResponse {
  success: boolean;
  message?: string;
  emailId?: string;
  error?: string;
}

export async function sendMeetingEmail(
  request: SendEmailRequest
): Promise<SendEmailResponse> {
  const { clientId, meetingId, ...body } = request;

  const response = await fetch(`${API_BASE}/api/meetings/${clientId}/${meetingId}/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
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
