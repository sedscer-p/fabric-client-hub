/**
 * Email templates for meeting summaries and discovery reports
 */

interface MeetingSummaryEmailParams {
  clientName: string;
  meetingType: string;
  meetingDate: string;
  advisorName: string;
  summary: string;
  transcription?: string;
  includeTranscription: boolean;
}

interface DiscoveryReportEmailParams {
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
 * Generate HTML email template for meeting summary
 */
export function generateMeetingSummaryEmail(params: MeetingSummaryEmailParams): string {
  const {
    clientName,
    meetingType,
    meetingDate,
    advisorName,
    summary,
    transcription,
    includeTranscription,
  } = params;

  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Convert summary paragraphs to HTML
  const summaryHtml = summary
    .split('\n\n')
    .map((paragraph) => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${paragraph}</p>`)
    .join('');

  const transcriptionSection = includeTranscription && transcription
    ? `
    <div style="margin-top: 32px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Full Transcription</h2>
      <div style="color: #4a5568; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${transcription}</div>
    </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Summary - ${meetingType}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Fabric</h1>
          <p style="margin: 8px 0 0 0; color: #e9d5ff; font-size: 14px;">Client Management Platform</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <!-- Meeting Info -->
          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">Meeting Summary</h2>
            <div style="display: table; width: 100%;">
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Client:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${clientName}</div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Meeting Type:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${meetingType}</div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Date:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formattedDate}</div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Advisor:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${advisorName}</div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Summary</h3>
            <div style="color: #374151;">
              ${summaryHtml}
            </div>
          </div>

          ${transcriptionSection}
        </div>

        <!-- Footer -->
        <div style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
            <strong>Confidential:</strong> This email contains confidential financial information. Please do not forward or share without authorization.
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Generated by Fabric Client Management Platform
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML email template for discovery report
 */
export function generateDiscoveryReportEmail(params: DiscoveryReportEmailParams): string {
  const { clientName, meetingDate, advisorName, report } = params;

  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Discovery Report - ${clientName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Fabric</h1>
          <p style="margin: 8px 0 0 0; color: #e9d5ff; font-size: 14px;">Client Management Platform</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <!-- Report Info -->
          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
            <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">Discovery Report</h2>
            <div style="display: table; width: 100%;">
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Client:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${clientName}</div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Date:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formattedDate}</div>
              </div>
              <div style="display: table-row;">
                <div style="display: table-cell; padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Advisor:</div>
                <div style="display: table-cell; padding: 8px 0; color: #1a1a1a; font-size: 14px;">${advisorName}</div>
              </div>
            </div>
          </div>

          <!-- Report Sections -->
          <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 12px 0; color: #667eea; font-size: 18px; font-weight: 600;">Risk Tolerance Assessment</h3>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${report.riskTolerance}</p>
          </div>

          <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 12px 0; color: #667eea; font-size: 18px; font-weight: 600;">Fact Find Summary</h3>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${report.factFind}</p>
          </div>

          <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 12px 0; color: #667eea; font-size: 18px; font-weight: 600;">Capacity for Loss Analysis</h3>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${report.capacityForLoss}</p>
          </div>

          <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 12px 0; color: #667eea; font-size: 18px; font-weight: 600;">Financial Objectives Overview</h3>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${report.financialObjectives}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
            <strong>Confidential:</strong> This discovery report contains highly confidential financial information. Please do not forward or share without authorization.
          </p>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
            <strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute financial advice. Please consult with your financial advisor before making any investment decisions.
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Generated by Fabric Client Management Platform
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of meeting summary email
 */
export function generateMeetingSummaryPlainText(params: MeetingSummaryEmailParams): string {
  const {
    clientName,
    meetingType,
    meetingDate,
    advisorName,
    summary,
    transcription,
    includeTranscription,
  } = params;

  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let plainText = `
MEETING SUMMARY
===============

Client: ${clientName}
Meeting Type: ${meetingType}
Date: ${formattedDate}
Advisor: ${advisorName}

SUMMARY
-------
${summary}
`;

  if (includeTranscription && transcription) {
    plainText += `

FULL TRANSCRIPTION
------------------
${transcription}
`;
  }

  plainText += `

---
Confidential: This email contains confidential financial information.
Generated by Fabric Client Management Platform
`;

  return plainText.trim();
}

/**
 * Generate plain text version of discovery report email
 */
export function generateDiscoveryReportPlainText(params: DiscoveryReportEmailParams): string {
  const { clientName, meetingDate, advisorName, report } = params;

  const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
DISCOVERY REPORT
===============

Client: ${clientName}
Date: ${formattedDate}
Advisor: ${advisorName}

RISK TOLERANCE ASSESSMENT
-------------------------
${report.riskTolerance}

FACT FIND SUMMARY
-----------------
${report.factFind}

CAPACITY FOR LOSS ANALYSIS
--------------------------
${report.capacityForLoss}

FINANCIAL OBJECTIVES OVERVIEW
------------------------------
${report.financialObjectives}

---
Confidential: This discovery report contains highly confidential financial information.
Disclaimer: This report is for informational purposes only and does not constitute financial advice.
Generated by Fabric Client Management Platform
`.trim();
}
