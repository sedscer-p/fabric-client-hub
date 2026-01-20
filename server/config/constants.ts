// Central configuration and constants for Fabric backend server

/**
 * Google Gemini API Configuration
 * Settings for Gemini API calls including model selection and token limits
 */
export const GEMINI_CONFIG = {
  // Model identifier for Gemini API
  MODEL: 'gemini-3-flash-preview',

  // Token limits for different API call types
  MAX_TOKENS: {
    MEETING_SUMMARY: 8192,           // For regular meeting summaries with actions
    DISCOVERY_MEETING_SUMMARY: 32768, // For discovery meeting summaries (more comprehensive, increased to handle long transcripts)
    DISCOVERY_REPORT: 4096,          // For individual discovery report sections
  },

  // Temperature setting (0-2, lower = more deterministic)
  TEMPERATURE: 0,

  // Response MIME type for structured outputs
  RESPONSE_MIME_TYPE: 'application/json',
} as const;

/**
 * Server Configuration
 * Express server and CORS settings
 */
export const SERVER_CONFIG = {
  // Server port (overridable via PORT env var)
  DEFAULT_PORT: 3001,

  // Frontend origin for CORS (production URL from env, fallback to localhost)
  FRONTEND_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',

  // Maximum size for JSON request bodies
  BODY_SIZE_LIMIT: '50mb',

  // API version
  API_VERSION: '1.0.0',
} as const;

/**
 * File Storage Configuration
 * Settings for saving action items and meeting data
 */
export const STORAGE_CONFIG = {
  // Root data folder (relative to server root)
  DATA_FOLDER: 'data_folder',

  // File names for action items (saved in meeting folders)
  FILE_NAMES: {
    CLIENT_ACTIONS: 'client_actions.json',
    ADVISER_ACTIONS: 'adviser_actions.json',
  },

  // Client ID to folder name mapping (shared with database service)
  CLIENT_FOLDER_MAP: {
    '1': 'rebecca-flemming',
    '2': 'james-francis',
  } as Record<string, string>,

  // JSON formatting
  JSON_INDENT: 2,
} as const;

/**
 * Prompts Configuration
 * Paths to prompt template files
 */
export const PROMPTS_CONFIG = {
  MEETING_SUMMARY_DISCOVERY: 'prompts/discovery-meeting-prompt.txt',
  MEETING_SUMMARY_REGULAR: 'prompts/regular-meeting-prompt.txt',
  MOCK_TRANSCRIPT: 'prompts/mock_transcript.txt',
  DOCUMENT_GENERATOR: 'prompts/document-generator.txt',
  DOCUMENT_TEMPLATES: 'prompts/document_description_templates.json',
} as const;

/**
 * Error Messages
 * Standardized error messages for API responses
 */
export const ERROR_MESSAGES = {
  VALIDATION: {
    MISSING_FIELDS: 'Missing required fields',
    INVALID_CLIENT_ID: 'Invalid client ID',
  },
  AI_SERVICE: {
    GENERATION_FAILED: 'Failed to generate meeting summary. Please try again.',
    REPORT_FAILED: 'Failed to generate discovery report. Please try again.',
    SAFETY_BLOCK: 'Request was blocked due to safety guidelines',
    TOKEN_LIMIT: 'Summary generation incomplete - token limit reached',
    FINISH_REASON_ERROR: 'Response generation stopped unexpectedly',
  },
  FILE_STORAGE: {
    SAVE_FAILED: 'Failed to save action items to file',
  },
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred',
  },
} as const;

/**
 * Email Configuration
 * Settings for Resend email service
 */
export const EMAIL_CONFIG = {
  // Email sender details (from environment variables)
  SENDER_EMAIL: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
  SENDER_NAME: process.env.SENDER_NAME || 'Fabric',

  // Rate limiting (emails per minute per user)
  RATE_LIMIT: {
    MAX_EMAILS_PER_MINUTE: 10,
  },

  // Email preferences
  DEFAULT_INCLUDE_TRANSCRIPTION: false,
  DEFAULT_INCLUDE_REPORT: false,
} as const;

/**
 * API Endpoints
 * Base paths for different API routes
 */
export const API_ENDPOINTS = {
  BASE: '/api',
  MEETINGS: '/api/meetings',
  HEALTH: '/api/health',
} as const;

/**
 * Meeting Types
 * Valid meeting type identifiers
 */
export const MEETING_TYPES = {
  DISCOVERY: 'discovery',
  REGULAR: 'regular',
} as const;

/**
 * Action Item Status
 * Valid statuses for action items
 */
export const ACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

// Type exports for TypeScript type safety
export type MeetingType = typeof MEETING_TYPES[keyof typeof MEETING_TYPES];
export type ActionStatus = typeof ACTION_STATUS[keyof typeof ACTION_STATUS];
