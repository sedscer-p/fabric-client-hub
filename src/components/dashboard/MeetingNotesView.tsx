import { Calendar, Play, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { meetingNotes, overallTrends } from '@/data/mockData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface MeetingNotesViewProps {
  clientId: string;
}

export function MeetingNotesView({ clientId }: MeetingNotesViewProps) {
  const notes = meetingNotes[clientId] || [];
  const trends = overallTrends[clientId] || [];

  return (
    <div className="px-12 pb-12 max-w-[800px]">
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
                  <div className="space-y-4 pt-2">
                    <div>
                      <p className="label-text mb-1">Summary</p>
                      <p className="text-sm text-foreground">{note.summary}</p>
                    </div>
                    
                    <div>
                      <p className="label-text mb-1">Transcription</p>
                      <p className="text-sm text-foreground bg-secondary p-3 rounded-lg">
                        {note.transcription}
                      </p>
                    </div>
                    
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
