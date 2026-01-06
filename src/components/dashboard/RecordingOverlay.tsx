import { Mic, Square, Loader2, Check, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'complete';

interface RecordingOverlayProps {
  state: RecordingState;
  meetingType: string;
  meetingTypeId: string;
  onStopRecording: () => void;
  onAcceptSummary: (selectedDocuments: string[]) => void;
  meetingSummary?: string;
}

const discoveryDocuments = [
  { 
    id: 'risk-tolerance', 
    label: 'Risk Tolerance Assessment',
    description: 'Investment objectives, income/expenditure, assets/liabilities, knowledge and experience, ability to bear investment risks'
  },
  { 
    id: 'fact-find', 
    label: 'Fact-Find/Know Your Customer Record',
    description: "Client's psychological willingness to take risk, investment experience, risk preferences"
  },
  { 
    id: 'capacity-for-loss', 
    label: 'Capacity for Loss Assessment',
    description: "Client's ability to absorb falls in investment value, known future spending requirements, emergency funds, other financial resources"
  },
  { 
    id: 'financial-objectives', 
    label: 'Financial Objectives Record',
    description: 'Investment purposes, time horizon, risk preferences, specific goals with priorities'
  },
];

export function RecordingOverlay({ 
  state, 
  meetingType,
  meetingTypeId,
  onStopRecording,
  onAcceptSummary,
  meetingSummary 
}: RecordingOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const [summaryAccepted, setSummaryAccepted] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

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
      setSelectedDocuments([]);
    }
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleAcceptSummary = () => {
    if (isDiscoveryMeeting) {
      setSummaryAccepted(true);
    } else {
      onAcceptSummary([]);
    }
  };

  const handleFinish = () => {
    onAcceptSummary(selectedDocuments);
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

          <div className="flex justify-end">
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
        </div>
      );
    }

    // Step 2: Document selection (only for discovery meetings)
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

          {/* Document Generation Options */}
          <div className="card-minimal p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <p className="section-header mb-0">Generate Documents</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Select which documents to generate from this discovery meeting
              </p>
            </div>
            <div className="space-y-3">
              {discoveryDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleDocumentToggle(doc.id)}
                >
                  <Checkbox
                    id={doc.id}
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={() => handleDocumentToggle(doc.id)}
                    className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={doc.id} 
                      className="text-sm font-medium text-foreground cursor-pointer block"
                    >
                      {doc.label}
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex justify-end gap-3">
            <Button 
              onClick={() => handleFinish()}
              variant="outline"
              className="h-10 px-6 border-border"
            >
              Skip
            </Button>
            <Button 
              onClick={handleFinish}
              disabled={selectedDocuments.length === 0}
              className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Generate {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      );
    }
  }

  return null;
}
