import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'complete';

interface RecordingOverlayProps {
  state: RecordingState;
  meetingType: string;
  onStopRecording: () => void;
  meetingSummary?: string;
}

export function RecordingOverlay({ 
  state, 
  meetingType, 
  onStopRecording,
  meetingSummary 
}: RecordingOverlayProps) {
  const [elapsed, setElapsed] = useState(0);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (state === 'idle') return null;

  if (state === 'recording') {
    return (
      <div className="card-minimal p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
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
    return (
      <div className="card-minimal p-6 mb-6">
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
    );
  }

  return null;
}
