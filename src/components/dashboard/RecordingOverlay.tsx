import { Mic, Square, Loader2, Check, FileText, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { sendMeetingEmail } from '@/services/api';
import { toast } from 'sonner';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'complete';

interface RecordingOverlayProps {
  state: RecordingState;
  meetingType: string;
  meetingTypeId: string;
  onStopRecording: () => void;
  onAcceptSummary: () => void;
  onGenerateDiscoveryReport?: () => void;
  onSkipReport?: () => void;
  meetingSummary?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  advisorName?: string;
  meetingId?: string;
}

const discoveryReportSections = [
  'Risk Tolerance Assessment',
  'Fact-Find/Know Your Customer Record',
  'Capacity for Loss Assessment',
  'Financial Objectives Record'
];

export function RecordingOverlay({
  state,
  meetingType,
  meetingTypeId,
  onStopRecording,
  onAcceptSummary,
  onGenerateDiscoveryReport,
  onSkipReport,
  meetingSummary,
  clientId,
  clientName,
  clientEmail,
  advisorName,
  meetingId
}: RecordingOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const [summaryAccepted, setSummaryAccepted] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('s.edscer@gmail.com');
  const [includeTranscription, setIncludeTranscription] = useState(false);

  const isDiscoveryMeeting = meetingTypeId === 'discovery';

  useEffect(() => {
    if (state !== 'recording') {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  // Reset accepted state when recording state changes
  useEffect(() => {
    if (state !== 'complete') {
      setSummaryAccepted(false);
    }
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const handleAcceptSummary = () => {
    // Always save the meeting first
    onAcceptSummary();
    // For discovery meetings, show the report option
    if (isDiscoveryMeeting) {
      setSummaryAccepted(true);
    }
  };

  const handleSkipReport = () => {
    if (onSkipReport) {
      onSkipReport();
    }
  };

  const handleGenerateReport = () => {
    if (onGenerateDiscoveryReport) {
      onGenerateDiscoveryReport();
    }
  };

  const handleOpenEmailDialog = () => {
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!clientId || !meetingId || !clientName || !advisorName) {
      toast.error('Missing required information to send email');
      return;
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setEmailSending(true);
    setEmailDialogOpen(false);

    try {
      await sendMeetingEmail({
        clientId,
        meetingId,
        recipientEmail,
        clientName,
        advisorName,
        includeTranscription,
      });
      toast.success(`Meeting summary sent to ${recipientEmail}`);
      // Reset to default
      setRecipientEmail('s.edscer@gmail.com');
      setIncludeTranscription(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  if (state === 'idle') return null;

  if (state === 'recording') {
    return (
      <div className="card-minimal p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Recording in Progress</p>
              <p className="text-xs text-muted-foreground">
                {meetingType} • {formatTime(elapsed)}
              </p>
            </div>
          </div>
          <Button 
            onClick={onStopRecording}
            variant="outline"
            className="h-10 px-4 border-border hover:bg-muted"
          >
            <Square className="w-4 h-4 mr-2 fill-current" strokeWidth={1.5} />
            End Recording
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div className="card-minimal p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-subtle flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Processing Recording</p>
            <p className="text-xs text-muted-foreground">
              Transcribing and generating meeting summary...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'complete' && meetingSummary) {
    // Step 1: Show summary and accept button
    if (!summaryAccepted) {
      return (
        <div className="space-y-6">
          <div className="card-minimal p-6">
            <div className="mb-4">
              <p className="section-header mb-2">Meeting Summary</p>
              <p className="text-xs text-muted-foreground">{meetingType}</p>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {meetingSummary}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleOpenEmailDialog}
              variant="outline"
              className="h-10 px-6 border-border"
              disabled={emailSending}
            >
              {emailSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
              ) : (
                <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
              )}
              {emailSending ? 'Sending...' : 'Email Summary'}
            </Button>
            <Button
              onClick={handleAcceptSummary}
              className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Accept Summary
              {isDiscoveryMeeting && (
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              )}
            </Button>
          </div>

          {/* Email Dialog */}
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Meeting Summary</DialogTitle>
                <DialogDescription>
                  Send the meeting summary to a specified email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTranscription"
                    checked={includeTranscription}
                    onCheckedChange={(checked) => setIncludeTranscription(checked as boolean)}
                  />
                  <Label
                    htmlFor="includeTranscription"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Include full transcription
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEmailDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>
                  Send Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    // Step 2: Discovery Report option (only for discovery meetings)
    if (summaryAccepted && isDiscoveryMeeting) {
      return (
        <div className="space-y-6">
          {/* Summary accepted confirmation */}
          <div className="card-minimal p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Summary Accepted</p>
                <p className="text-xs text-muted-foreground">{meetingType}</p>
              </div>
            </div>
          </div>

          {/* Discovery Report Option */}
          <div className="card-minimal p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <p className="section-header mb-0">Generate Discovery Report</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Would you like to generate a comprehensive discovery report from this meeting?
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm font-medium text-foreground mb-2">Discovery Report Includes:</p>
              <ul className="space-y-1">
                {discoveryReportSections.map((section) => (
                  <li key={section} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    {section}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSkipReport}
              variant="outline"
              className="h-10 px-6 border-border"
            >
              Skip
            </Button>
            <Button
              onClick={handleGenerateReport}
              className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Generate Report
            </Button>
          </div>
        </div>
      );
    }
  }

  return null;
}
