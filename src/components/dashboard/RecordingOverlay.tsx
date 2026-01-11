import { Mic, Square, Loader2, Check, FileText, ArrowRight, Mail, X } from 'lucide-react';
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
import { sendMeetingEmail, generateDocument, saveDocument } from '@/services/api';
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
  meetingDate?: string;
  transcription?: string;
  summaryAccepted: boolean;
  onSummaryAcceptedChange: (accepted: boolean) => void;
  generatedDoc: string | null;
  onGeneratedDocChange: (doc: string | null) => void;
  selectedDocType: string;
  onSelectedDocTypeChange: (type: string) => void;
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
  meetingId,
  meetingDate,
  transcription,
  summaryAccepted,
  onSummaryAcceptedChange,
  generatedDoc,
  onGeneratedDocChange,
  selectedDocType,
  onSelectedDocTypeChange
}: RecordingOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const [emailSending, setEmailSending] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('s.edscer@gmail.com');
  const [includeTranscription, setIncludeTranscription] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Hardcoded document types for now (could be fetched from API later)
  const documentTypes = [
    { id: 'discovery_document', name: 'Discovery Report' },
  ];

  const handleGenerateCustomDocument = async () => {
    if (!clientId || !meetingId || !transcription) {
      toast.error('Missing information to generate document');
      return;
    }

    setIsGeneratingDoc(true);
    onGeneratedDocChange(null);

    try {
      const response = await generateDocument({
        clientId,
        meetingId,
        documentType: selectedDocType,
        transcription,
        meetingDate: meetingDate || new Date().toISOString(),
        meetingType: meetingType
      });

      onGeneratedDocChange(response.document);
      toast.success('Document generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate document');
    } finally {
      setIsGeneratingDoc(false);
    }
  };


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
    // Always save the meeting first
    onAcceptSummary();

    if (isDiscoveryMeeting) {
      // For discovery meetings, transition to the document generation view
      onSummaryAcceptedChange(true);
    } else {
      // For other meetings, we are done
      handleSkipReport();
      toast.success('Meeting summary accepted');
    }
  };

  const handleAcceptDocument = async () => {
    if (!generatedDoc || !clientId || !meetingId || !meetingDate) return;

    try {
      await saveDocument({
        clientId,
        meetingId,
        documentType: selectedDocType,
        content: generatedDoc,
        meetingDate,
        meetingType
      });

      toast.success('Document saved successfully');
      handleSkipReport(); // Finish the workflow
    } catch (error: any) {
      toast.error(error.message || 'Failed to save document');
    }
  };

  const handleSkipReport = () => {
    if (onSkipReport) {
      onSkipReport();
    }
  };

  const handleReject = () => {
    // If we have a generated doc, just clear it
    if (generatedDoc) {
      onGeneratedDocChange(null);
      toast.info('Document generation cancelled');
    } else {
      // If we are rejecting the summary, go back to idle or skip
      handleSkipReport();
      toast.info('Meeting summary rejected');
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
                {isDiscoveryMeeting && (
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                )}
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

    // Step 2: Discovery Report option (only for discovery meetings)
    if (summaryAccepted && isDiscoveryMeeting) {
      return (
        <div className="px-12 pt-12 pb-12 max-w-[800px] space-y-8">
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

          {/* Document Generation Option */}
          <div className="card-minimal p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <p className="section-header mb-0">Generate Document</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Select a document type to generate from this meeting transcript.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedDocType}
                  onChange={(e) => onSelectedDocTypeChange(e.target.value)}
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <Button
                  onClick={handleGenerateCustomDocument}
                  disabled={isGeneratingDoc}
                  className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                >
                  {isGeneratingDoc ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  )}
                  {isGeneratingDoc ? 'Generating...' : 'Generate'}
                </Button>
              </div>

              {generatedDoc && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Generated {selectedDocType.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          onGeneratedDocChange(null);
                          toast.info('Document rejected');
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAcceptDocument}
                        className="h-8 text-primary hover:bg-primary/10"
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedDoc);
                          toast.success('Copied to clipboard');
                        }}
                        className="h-8 px-2"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="p-10 rounded-xl border border-primary/20 bg-primary/5 max-h-[600px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
                    <div className="text-sm text-foreground/90 leading-relaxed font-normal space-y-4">
                      {generatedDoc.split('\n').filter(p => p.trim()).map((para, i) => (
                        <p key={i}>
                          {para.split(/(\*\*.*?\*\*)/).map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* No bottom buttons - Accept/Reject at top handle workflow */}
        </div>
      );
    }
  }

  return null;
}

