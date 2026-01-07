// Express server for Fabric backend API
// Handles meeting processing, summarization, and discovery report generation

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import meetingsRouter from './routes/meetings.js';
import { SERVER_CONFIG } from './config/constants.js';

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.DEFAULT_PORT;

// Middleware
app.use(
  cors({
    origin: SERVER_CONFIG.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Increase JSON limit to support large audio files in the future
app.use(express.json({ limit: SERVER_CONFIG.BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: SERVER_CONFIG.BODY_SIZE_LIMIT }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/meetings', meetingsRouter);

// Root endpoint - API info
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Fabric Backend API',
    version: SERVER_CONFIG.API_VERSION,
    status: 'running',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    endpoints: {
      health: '/api/health',
      meetings: '/api/meetings',
    },
    frontend: SERVER_CONFIG.FRONTEND_ORIGIN,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);

  // Anthropic API errors
  if (err.name === 'APIError' || err.message?.includes('Anthropic')) {
    return res.status(502).json({
      error: 'AI service error',
      message: 'Failed to communicate with AI service. Please try again.',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
    });
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  });
});

// Helper function to mask API key
const maskApiKey = (key: string | undefined): string => {
  if (!key) return '✗ Not configured';
  const visibleStart = 12; // Show "sk-ant-api03-"
  const visibleEnd = 4;
  if (key.length <= visibleStart + visibleEnd) return key;
  const masked = key.substring(0, visibleStart) + '...' + key.substring(key.length - visibleEnd);
  return `✓ ${masked}`;
};

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Fabric Backend Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Anthropic API: ${maskApiKey(process.env.ANTHROPIC_API_KEY)}`);
  console.log(`⏰ Started at ${new Date().toISOString()}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
