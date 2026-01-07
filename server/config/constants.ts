// Central configuration and constants for Fabric backend server

/**
 * Anthropic API Configuration
 * Settings for Claude API calls including model selection and token limits
 */
export const ANTHROPIC_CONFIG = {
  // Model identifier for Claude API
  MODEL: 'claude-sonnet-4-5-20250929',

  // Beta features to enable
  BETA_FEATURES: ['structured-outputs-2025-11-13'],

  // Token limits for different API call types
  MAX_TOKENS: {
    MEETING_SUMMARY: 2048,     // For structured meeting summaries with actions
    DISCOVERY_REPORT: 800,     // For individual discovery report sections
  },

  // Temperature setting (0-1, lower = more deterministic)
  // Currently using default (1.0) - uncomment to customize
  // TEMPERATURE: 1.0,
} as const;

/**
 * Server Configuration
 * Express server and CORS settings
 */
export const SERVER_CONFIG = {
  // Server port (overridable via PORT env var)
  DEFAULT_PORT: 3001,

  // Frontend origin for CORS
  FRONTEND_ORIGIN: 'http://localhost:8080',

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
  // Directory for action item JSON files (relative to project root)
  DATA_DIRECTORY: 'src/data',

  // File naming patterns
  FILE_NAMES: {
    CLIENT_ACTIONS: (clientId: string) => `client_actions_${clientId}.json`,
    ADVISER_ACTIONS: (clientId: string) => `adviser_actions_${clientId}.json`,
  },

  // JSON formatting
  JSON_INDENT: 2,
} as const;

/**
 * Prompts Configuration
 * Paths to prompt template files
 */
export const PROMPTS_CONFIG = {
  MEETING_SUMMARY: 'prompts/meeting-summary-prompt.txt',
  MOCK_TRANSCRIPT: 'prompts/mock_transcript.txt',
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
    REFUSAL: 'Request was refused due to safety guidelines',
    TOKEN_LIMIT: 'Summary generation incomplete - token limit reached',
  },
  FILE_STORAGE: {
    SAVE_FAILED: 'Failed to save action items to file',
  },
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred',
  },
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
  ANNUAL: 'annual',
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
