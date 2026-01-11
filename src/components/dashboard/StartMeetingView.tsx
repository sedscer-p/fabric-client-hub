import { useState, useMemo } from 'react';
import { Mic, Calendar, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { meetingTypes } from '@/data/mockData';

interface StartMeetingViewProps {
  clientId: string;
  selectedMeetingType: string;
  onMeetingTypeChange: (type: string) => void;
  selectedTranscript: string;
  onTranscriptChange: (transcript: string) => void;
  onStartRecording: () => void;
}

export function StartMeetingView({
  clientId,
  selectedMeetingType,
  onMeetingTypeChange,
  selectedTranscript,
  onTranscriptChange,
  onStartRecording
}: StartMeetingViewProps) {
  const [hasConsent, setHasConsent] = useState(false);

  // Get client folder name from clientId
  const clientFolderName = clientId === '1' ? 'rebecca-flemming' : clientId === '2' ? 'james-francis' : '';

  // Available transcripts based on client
  const availableTranscripts = useMemo(() => {
    if (!clientFolderName) return [];

    const transcripts = [
      { id: `${clientFolderName}-discovery-meeting`, label: 'Discovery Meeting' },
      { id: `${clientFolderName}-regular-meeting`, label: 'Regular Meeting' },
      { id: `${clientFolderName}-regular-meeting2`, label: 'Regular Meeting 2' },
    ];

    return transcripts;
  }, [clientFolderName]);

  const canRecord = selectedMeetingType && hasConsent && selectedTranscript;

  return (
    <div className="px-12 pt-12 pb-12 max-w-[800px]">
      <div className="content-card max-w-lg mx-auto mt-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Start a Meeting</h2>
          <p className="text-sm text-muted-foreground">
            Select a meeting type and confirm consent to begin recording
          </p>
        </div>

        <div className="space-y-6">
          {/* Meeting Type Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Meeting Type
            </label>
            <Select
              value={selectedMeetingType}
              onValueChange={onMeetingTypeChange}
            >
              <SelectTrigger className="w-full h-11 bg-card border-border text-sm font-normal px-3 focus:ring-2 focus:ring-offset-0 focus:ring-accent-subtle focus:border-primary">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <SelectValue placeholder="Select meeting type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {meetingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} className="text-sm">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transcript Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Transcript
            </label>
            <Select
              value={selectedTranscript}
              onValueChange={onTranscriptChange}
            >
              <SelectTrigger className="w-full h-11 bg-card border-border text-sm font-normal px-3 focus:ring-2 focus:ring-offset-0 focus:ring-accent-subtle focus:border-primary">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <SelectValue placeholder="Select transcript" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {availableTranscripts.map((transcript) => (
                  <SelectItem key={transcript.id} value={transcript.id} className="text-sm">
                    {transcript.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Checkbox
              id="consent"
              checked={hasConsent}
              onCheckedChange={(checked) => setHasConsent(checked === true)}
              className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="consent"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I confirm that the client has consented to being recorded
            </label>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle
                className={`w-4 h-4 ${selectedMeetingType ? 'text-primary' : 'text-muted-foreground/50'}`}
                strokeWidth={1.5}
              />
              <span className={selectedMeetingType ? 'text-foreground' : 'text-muted-foreground'}>
                Meeting type selected
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle
                className={`w-4 h-4 ${selectedTranscript ? 'text-primary' : 'text-muted-foreground/50'}`}
                strokeWidth={1.5}
              />
              <span className={selectedTranscript ? 'text-foreground' : 'text-muted-foreground'}>
                Transcript selected
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle
                className={`w-4 h-4 ${hasConsent ? 'text-primary' : 'text-muted-foreground/50'}`}
                strokeWidth={1.5}
              />
              <span className={hasConsent ? 'text-foreground' : 'text-muted-foreground'}>
                Consent confirmed
              </span>
            </div>
          </div>

          {/* Record Meeting Button */}
          <Button
            onClick={onStartRecording}
            disabled={!canRecord}
            size="lg"
            className="w-full h-12 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Start Recording
          </Button>
        </div>
      </div>
    </div>
  );
}