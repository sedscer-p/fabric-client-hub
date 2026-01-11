import { Mic, Square, Loader2, Check, Mail, X } from 'lucide-react';
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
  meetingSummary?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  advisorName?: string;
  meetingId?: string;
  meetingDate?: string;
  transcription?: string;
  summaryAccepted: boolean;
  onSummaryAcceptedChange: (accepted: boolean) => void;
}

export function RecordingOverlay({
  state,
  meetingType,
  meetingTypeId,
  onStopRecording,
  onAcceptSummary,
  meetingSummary,
  clientId,
  clientName,
  clientEmail,
  advisorName,
  meetingId,
  meetingDate,
  transcription,
  summaryAccepted,
  onSummaryAcceptedChange,
}: RecordingOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const [emailSending, setEmailSending] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('s.edscer@gmail.com');
  const [includeTranscription, setIncludeTranscription] = useState(false);

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
    if (state !== 'complete' && state !== 'idle') {
      onSummaryAcceptedChange(false);
    }
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const handleAcceptSummary = () => {
    // Save the meeting
    onAcceptSummary();
    toast.success('Meeting summary accepted');
  };

  const handleReject = () => {
    toast.info('Meeting summary rejected');
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
      <div className="px-12 pt-12 pb-12 max-w-[800px]">
        <div className="card-minimal p-8 mb-6">
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
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div className="px-12 pt-12 pb-12 max-w-[800px]">
        <div className="card-minimal p-8 mb-6">
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
      </div>
    );
  }

  if (state === 'complete' && meetingSummary) {
    // Step 1: Show summary and accept button
    if (!summaryAccepted) {
      return (
        <div className="px-12 pt-12 pb-12 max-w-[800px] space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="section-header mb-0">Meeting Summary</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{meetingType}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="h-8 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Reject
              </Button>
              <Button
                onClick={handleOpenEmailDialog}
                variant="outline"
                size="sm"
                className="h-8 border-border"
                disabled={emailSending}
              >
                {emailSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                onClick={handleAcceptSummary}
                size="sm"
                className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Accept
              </Button>
            </div>
          </div>

          <div className="card-minimal p-10 border-primary/10 shadow-sm">
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-foreground/90 leading-relaxed space-y-4">
                {meetingSummary.split('\n').filter(p => p.trim()).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
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
  }

  return null;
}

