// Shared TypeScript interfaces for backend API

// MeetingNote interface matching frontend structure
export interface MeetingNote {
  id: string;
  date: string;
  type: string;
  summary: string;
  transcription: string;
  hasAudio: boolean;
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
}

export interface SaveMeetingRequest {
  clientId: string;
  meetingId: string;
  meetingType: string;
  summary: string;
  transcription: string;
  date: string;          // ISO date string
  hasAudio: boolean;
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
