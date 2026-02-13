import { Calendar, Play, TrendingUp, FileText, CheckSquare, Mail, Loader2, ChevronDown, ChevronUp, Copy, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeetingNote } from '@/data/mockData';
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

const CollapsibleDocument = ({
  title,
  content,
  icon: Icon,
  defaultOpen = false,
  actions
}: {
  title: string,
  content: string,
  icon: any,
  defaultOpen?: boolean,
  actions?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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

  return (
    <div className="border border-gold/20 rounded-lg overflow-hidden bg-white shadow-sm mb-4 last:mb-0 transition-all hover:border-gold/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-offwhite hover:bg-gold/5 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-serif font-semibold text-navy">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gold" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-6 bg-white animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-sm text-navy leading-relaxed">
            {renderMarkdown(content)}
          </div>
        </div>
      )}
    </div>
  );
};


export function MeetingNotesView({ clientId, meetingNotes, clientName, clientEmail, advisorName }: MeetingNotesViewProps) {
  const notes = meetingNotes;
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
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
      // Reset to empty
      setRecipientEmail('');
      setIncludeTranscription(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSendingEmailFor(null);
    }
  };

  return (
    <div className="px-6 pt-6 pb-24 bg-offwhite min-h-screen">
      {/* Meeting Notes */}
      <section>
        <h2 className="text-2xl font-serif font-bold text-navy mb-6">Meeting Notes</h2>

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
                  <div className="flex items-center justify-between w-full gap-8">
                    <div className="flex items-center gap-3 text-left flex-1">
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
                      className="h-8 px-3 gap-2 mr-6"
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
                    <TabsList className="w-full grid grid-cols-4 mb-4 h-auto bg-transparent border-b border-gold/20 rounded-none p-0">
                      <TabsTrigger
                        value="actions"
                        className="gap-2 rounded-none border-b-3 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-navy pb-3 font-sans"
                      >
                        <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
                        Actions
                      </TabsTrigger>
                      <TabsTrigger
                        value="summary"
                        className="gap-2 rounded-none border-b-3 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-navy pb-3 font-sans"
                      >
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger
                        value="reports"
                        className="gap-2 rounded-none border-b-3 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-navy pb-3 font-sans"
                      >
                        <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                        Reports
                      </TabsTrigger>
                      <TabsTrigger
                        value="transcription"
                        className="gap-2 rounded-none border-b-3 border-transparent data-[state=active]:border-gold data-[state=active]:bg-transparent data-[state=active]:text-navy pb-3 font-sans"
                      >
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
                      <CollapsibleDocument
                        title="Meeting Summary"
                        icon={FileText}
                        content={note.summary}
                        defaultOpen={true}
                        actions={
                          note.hasAudio && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                              title="Play Recording"
                            >
                              <Headphones className="w-3.5 h-3.5" />
                            </Button>
                          )
                        }
                      />
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0">
                      {note.reports && note.reports.length > 0 ? (
                        <div className="space-y-4">
                          {note.reports.map((report, idx) => (
                            <CollapsibleDocument
                              key={idx}
                              title={report.type}
                              icon={TrendingUp}
                              content={report.content}
                              actions={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                                  onClick={() => {
                                    navigator.clipboard.writeText(report.content);
                                    toast.success('Report copied to clipboard');
                                  }}
                                  title="Copy Report"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-secondary/5 rounded-xl border border-dashed border-border">
                          <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
                          <p className="text-sm text-muted-foreground font-medium">No reports generated yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Generate a document after a meeting to see it here
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="transcription" className="mt-0">
                      <CollapsibleDocument
                        title="Meeting Transcription"
                        icon={FileText}
                        content={note.transcription}
                      />
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
                placeholder="Type your email here..."
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
