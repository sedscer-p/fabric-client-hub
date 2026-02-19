import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AudioRecorder } from './AudioRecorder';

interface NewInterviewViewProps {
  onBack: () => void;
}

interface TranscriptionResult {
  transcript: string;
  formatted_transcript: string;
  speakers: { speaker: number; text: string; start_time: number; end_time: number }[];
  duration_seconds: number;
  speaker_count: number;
}

export function NewInterviewView({ onBack }: NewInterviewViewProps) {
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    setTranscription(result);
    setError(null);
    console.log('Transcription complete:', result);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTranscription(null);
  };

  const handleGenerateSummary = async () => {
    if (!transcription) return;

    setIsGeneratingSummary(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/meetings/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_type: 'discovery',
          transcript: transcription.formatted_transcript,
          client_id: '1', // Placeholder - will be replaced with contact selection in Phase 2
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Summary generation failed');
      }

      const result = await response.json();
      console.log('Summary generated:', result);

      // TODO: Navigate to summary view or display summary
      alert('Summary generated successfully! (Phase 2 will add proper UI for this)');
    } catch (err: any) {
      console.error('Summary generation error:', err);
      setError(err.message || 'Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">New Interview</h1>
            <p className="text-sm text-muted-foreground">
              Record or upload audio
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Audio Recorder */}
        {!transcription && (
          <div>
            <h2 className="text-base font-semibold mb-3">Record Interview</h2>
            <AudioRecorder
              onTranscriptionComplete={handleTranscriptionComplete}
              onError={handleError}
            />
          </div>
        )}

        {/* Transcription Result */}
        {transcription && (
          <div className="space-y-4">
            {/* Success Message */}
            <Card className="p-4 bg-green-500/10 border-green-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Transcription complete!
                </p>
              </div>
            </Card>

            {/* Metadata */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Recording Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">{formatDuration(transcription.duration_seconds)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Speakers:</span>
                  <p className="font-medium">{transcription.speaker_count}</p>
                </div>
              </div>
            </Card>

            {/* Formatted Transcript */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Transcript (by Speaker)</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {transcription.formatted_transcript}
                </pre>
              </div>
            </Card>

            {/* Full Transcript */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Full Transcript</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {transcription.transcript}
              </p>
            </Card>

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? 'Generating Summary...' : 'Continue to Summary Generation'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTranscription(null)}
                disabled={isGeneratingSummary}
              >
                Record Another Interview
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
