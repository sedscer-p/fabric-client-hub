import { Calendar, FileText, Play, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Meeting Notes</h2>
        
        {notes.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No meeting notes available.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {notes.map((note) => (
              <AccordionItem key={note.id} value={note.id} className="border border-border rounded-lg bg-card">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(note.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <Badge variant="secondary">{note.type}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                      <p className="text-foreground">{note.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Transcription</h4>
                      <p className="text-foreground text-sm bg-secondary/50 p-3 rounded-lg">
                        {note.transcription}
                      </p>
                    </div>
                    
                    {note.hasAudio && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Play className="w-4 h-4" />
                        Play Audio Recording
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Overall Trends
        </h2>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            {trends.length === 0 ? (
              <p className="text-muted-foreground">No trends identified yet.</p>
            ) : (
              <ul className="space-y-3">
                {trends.map((trend, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground">{trend}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
