import { Calendar, Play, TrendingUp, FileText, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeetingNote, overallTrends } from '@/data/mockData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MeetingNotesViewProps {
  clientId: string;
  meetingNotes: MeetingNote[];
}

export function MeetingNotesView({ clientId, meetingNotes }: MeetingNotesViewProps) {
  const notes = meetingNotes;
  const trends = overallTrends[clientId] || [];

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
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckSquare className="w-12 h-12 text-muted-foreground/50 mb-3" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground font-medium">Actions coming soon</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Action items extracted from this meeting will appear here
                        </p>
                      </div>
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
    </div>
  );
}
