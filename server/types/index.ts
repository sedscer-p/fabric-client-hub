// Shared TypeScript interfaces for backend API

// Action item interface matching frontend structure
export interface MeetingActionItem {
  id: string;
  text: string;
  status: 'pending' | 'complete';
  dueDate?: string;
}

// MeetingNote interface matching frontend structure
export interface MeetingNote {
  id: string;
  date: string;
  type: string;
  summary: string;
  transcription: string;
  hasAudio: boolean;
  clientActions?: MeetingActionItem[];
  advisorActions?: MeetingActionItem[];
}

// API Request/Response types

export interface ProcessMeetingRequest {
  clientId: string;
  meetingType: string; // 'discovery' | 'regular' | 'annual'
  duration: number;    // Recording duration in seconds
}

export interface ProcessMeetingResponse {
  transcription: string;
  summary: string;
  meetingId: string;
  structuredData?: MeetingSummaryStructuredOutput;
}

export interface SaveMeetingRequest {
  clientId: string;
  meetingId: string;
  meetingType: string;
  summary: string;
  transcription: string;
  date: string;          // ISO date string
  hasAudio: boolean;
  clientActions?: MeetingActionItem[];
  advisorActions?: MeetingActionItem[];
}

export interface SaveMeetingResponse {
  success: boolean;
  meetingNote: MeetingNote;
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

// Structured output from Claude API for meeting summaries
export interface MeetingSummaryStructuredOutput {
  meeting_summary: string;
  adviser_actions: string[];
  client_actions: string[];
}

// Action item for JSON file storage
export interface ActionItem {
  id: string;
  text: string;
  status: 'pending';
  fromMeetingDate: string;
  meetingId: string;
}

// JSON file format for client/adviser actions
export interface ActionItemsFile {
  clientId: string;
  meetingId: string;
  meetingDate: string;
  actions: ActionItem[];
}
