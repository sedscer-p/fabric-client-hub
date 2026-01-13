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

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-none space-y-2 my-3">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gold mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      // H2 heading (##)
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-lg font-serif font-bold text-navy mt-4 mb-2 first:mt-0">
            {line.slice(3)}
          </h2>
        );
      }
      // H3 heading (###)
      else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-base font-serif font-semibold text-navy mt-3 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      // Bullet point (*)
      else if (line.trim().startsWith('* ')) {
        currentList.push(line.trim().slice(2));
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
      }
      // Regular paragraph
      else if (line.trim()) {
        flushList();
        // Handle bold text (**text**)
        const parts = line.split(/(\*\*.*?\*\*)/);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        elements.push(
          <p key={index} className="my-2">
            {rendered}
          </p>
        );
      }
    });

    flushList();
    return elements;
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
      <div className="px-6 pt-6 pb-24 bg-offwhite min-h-screen">
        <div className="bg-white rounded-xl border border-gold/20 p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy">Recording in Progress</p>
                <p className="text-xs text-muted-foreground">
                  {meetingType} • {formatTime(elapsed)}
                </p>
              </div>
            </div>
            <Button
              onClick={onStopRecording}
              variant="outline"
              className="w-full h-11 border-navy text-navy hover:bg-navy/5"
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
      <div className="px-6 pt-6 pb-24 bg-offwhite min-h-screen">
        <div className="bg-white rounded-xl border border-gold/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-gold animate-spin" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy">Processing Recording</p>
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
        <div className="px-6 pt-6 pb-24 bg-offwhite min-h-screen">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-xl font-serif font-bold text-navy mb-1">Meeting Summary</h2>
              <p className="text-xs text-gold uppercase tracking-wider font-semibold">{meetingType}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="h-10 flex-1 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
              <Button
                onClick={handleOpenEmailDialog}
                variant="outline"
                size="sm"
                className="h-10 px-4 border-gold/30"
                disabled={emailSending}
              >
                {emailSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleAcceptSummary}
                size="sm"
                className="h-10 flex-1 bg-navy text-white hover:bg-navy/90"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Accept
              </Button>
            </div>

            {/* Summary Content */}
            <div className="bg-white rounded-xl border border-gold/20 p-5 shadow-sm">
              <div className="text-sm text-navy leading-relaxed">
                {renderMarkdown(meetingSummary)}
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

