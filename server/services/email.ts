import { Resend } from 'resend';
import {
  generateMeetingSummaryEmail,
  generateMeetingSummaryPlainText,
  generateDiscoveryReportEmail,
  generateDiscoveryReportPlainText,
} from './emailTemplates.js';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration from environment variables
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
const SENDER_NAME = process.env.SENDER_NAME || 'Fabric Client Management';

/**
 * Email sending options
 */
interface SendMeetingSummaryEmailOptions {
  recipientEmail: string;
  recipientName: string;
  clientName: string;
  meetingType: string;
  meetingDate: string;
  advisorName: string;
  summary: string;
  transcription?: string;
  includeTranscription?: boolean;
}

interface SendDiscoveryReportEmailOptions {
  recipientEmail: string;
  recipientName: string;
  clientName: string;
  meetingDate: string;
  advisorName: string;
  report: {
    riskTolerance: string;
    factFind: string;
    capacityForLoss: string;
    financialObjectives: string;
  };
}

/**
 * Email sending result
 */
export interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Send meeting summary email to client
 */
export async function sendMeetingSummaryEmail(
  options: SendMeetingSummaryEmailOptions
): Promise<EmailResult> {
  try {
    const {
      recipientEmail,
      recipientName,
      clientName,
      meetingType,
      meetingDate,
      advisorName,
      summary,
      transcription,
      includeTranscription = false,
    } = options;

    // Validate email address
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return {
        success: false,
        error: 'Invalid recipient email address',
      };
    }

    // Generate email content
    const html = generateMeetingSummaryEmail({
      clientName,
      meetingType,
      meetingDate,
      advisorName,
      summary,
      transcription,
      includeTranscription,
    });

    const text = generateMeetingSummaryPlainText({
      clientName,
      meetingType,
      meetingDate,
      advisorName,
      summary,
      transcription,
      includeTranscription,
    });

    const subject = `Meeting Summary - ${meetingType} - ${new Date(meetingDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;

    // Send email via Resend
    if (!resend) {
      return {
        success: false,
        error: 'Email service not configured (RESEND_API_KEY missing)',
      };
    }

    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [recipientEmail],
      subject,
      html,
      text,
    });

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error: any) {
    console.error('Failed to send meeting summary email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send discovery report email to client
 */
export async function sendDiscoveryReportEmail(
  options: SendDiscoveryReportEmailOptions
): Promise<EmailResult> {
  try {
    const {
      recipientEmail,
      recipientName,
      clientName,
      meetingDate,
      advisorName,
      report,
    } = options;

    // Validate email address
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return {
        success: false,
        error: 'Invalid recipient email address',
      };
    }

    // Generate email content
    const html = generateDiscoveryReportEmail({
      clientName,
      meetingDate,
      advisorName,
      report,
    });

    const text = generateDiscoveryReportPlainText({
      clientName,
      meetingDate,
      advisorName,
      report,
    });

    const subject = `Discovery Report - ${clientName} - ${new Date(meetingDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;

    // Send email via Resend
    if (!resend) {
      return {
        success: false,
        error: 'Email service not configured (RESEND_API_KEY missing)',
      };
    }

    const result = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [recipientEmail],
      subject,
      html,
      text,
    });

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error: any) {
    console.error('Failed to send discovery report email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Validate Resend API key configuration
 */
export function validateEmailConfiguration(): { valid: boolean; error?: string } {
  if (!process.env.RESEND_API_KEY) {
    return {
      valid: false,
      error: 'RESEND_API_KEY environment variable is not set',
    };
  }

  if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    return {
      valid: false,
      error: 'RESEND_API_KEY appears to be invalid (should start with "re_")',
    };
  }

  if (!SENDER_EMAIL || !SENDER_EMAIL.includes('@')) {
    return {
      valid: false,
      error: 'SENDER_EMAIL environment variable is not set or invalid',
    };
  }

  return { valid: true };
}
