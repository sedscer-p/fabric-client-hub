import { Calendar, Play, TrendingUp, FileText, CheckSquare, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeetingNote, overallTrends } from '@/data/mockData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ActionsTab } from './ActionsTab';
import { sendMeetingEmail } from '@/services/api';
import { toast } from 'sonner';
import { useState } from 'react';

interface MeetingNotesViewProps {
  clientId: string;
  meetingNotes: MeetingNote[];
  clientName?: string;
  clientEmail?: string;
  advisorName?: string;
}

export function MeetingNotesView({ clientId, meetingNotes, clientName, clientEmail, advisorName }: MeetingNotesViewProps) {
  const notes = meetingNotes;
  const trends = overallTrends[clientId] || [];
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('s.edscer@gmail.com');
  const [includeTranscription, setIncludeTranscription] = useState(false);

  const handleOpenEmailDialog = (meetingId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent accordion from toggling
    setSelectedMeetingId(meetingId);
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!clientName || !advisorName) {
      toast.error('Missing client information to send email');
      return;
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingEmailFor(selectedMeetingId);
    setEmailDialogOpen(false);

    try {
      await sendMeetingEmail({
        clientId,
        meetingId: selectedMeetingId,
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
      setSendingEmailFor(null);
    }
  };

  return (
    <div className="px-12 pt-12 pb-12 max-w-[800px]">
      {/* Meeting Notes */}
      <section>
        <h2 className="section-header mb-4">Meeting Notes</h2>
        
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No meeting notes available.</p>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {notes.map((note) => (
              <AccordionItem 
                key={note.id} 
                value={note.id} 
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary transition-fast">
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-4 h-4" strokeWidth={1.5} />
                        {new Date(note.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="text-xs text-secondary-foreground bg-secondary px-2 py-0.5 rounded">
                        {note.type}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 gap-2"
                      onClick={(e) => handleOpenEmailDialog(note.id, e)}
                      disabled={sendingEmailFor === note.id}
                    >
                      {sendingEmailFor === note.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <Mail className="w-4 h-4" strokeWidth={1.5} />
                      )}
                      <span className="text-xs">
                        {sendingEmailFor === note.id ? 'Sending...' : 'Email'}
                      </span>
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Tabs defaultValue="actions" className="w-full">
                    <TabsList className="w-full grid grid-cols-4 mb-4">
                      <TabsTrigger value="actions" className="gap-2">
                        <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
                        Actions
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="gap-2">
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="reports" className="gap-2">
                        <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                        Reports
                      </TabsTrigger>
                      <TabsTrigger value="transcription" className="gap-2">
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                        Transcription
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="actions" className="mt-0">
                      {(note.clientActions?.length || note.advisorActions?.length) ? (
                        <ActionsTab
                          clientActions={note.clientActions}
                          advisorActions={note.advisorActions}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <CheckSquare className="w-12 h-12 text-muted-foreground/50 mb-3" strokeWidth={1.5} />
                          <p className="text-sm text-muted-foreground font-medium">No actions</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            No action items were extracted from this meeting
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="summary" className="mt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{note.summary}</p>
                        {note.hasAudio && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 text-sm font-medium border-border hover:bg-secondary"
                          >
                            <Play className="w-4 h-4" strokeWidth={1.5} />
                            Play Audio Recording
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0">
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <TrendingUp className="w-12 h-12 text-muted-foreground/50 mb-3" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground font-medium">Reports coming soon</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Discovery reports and analysis will appear here
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="transcription" className="mt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-foreground bg-secondary p-3 rounded-lg whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                          {note.transcription}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      {/* Overall Trends */}
      <section className="mt-8">
        <h2 className="section-header mb-4">Overall Trends</h2>
        {trends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trends identified yet.</p>
        ) : (
          <ul className="space-y-3">
            {trends.map((trend, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="bullet-accent" />
                <span className="text-sm text-foreground">{trend}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
              <Label htmlFor="email-meeting-notes">Recipient Email</Label>
              <Input
                id="email-meeting-notes"
                type="email"
                placeholder="email@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTranscription-meeting-notes"
                checked={includeTranscription}
                onCheckedChange={(checked) => setIncludeTranscription(checked as boolean)}
              />
              <Label
                htmlFor="includeTranscription-meeting-notes"
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
