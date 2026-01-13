import { useState, useMemo } from 'react';
import { Mic, CheckCircle } from 'lucide-react';
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
    <div className="px-6 pt-6 pb-24 bg-offwhite min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Central Microphone Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-xl">
            <Mic className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-serif font-bold text-navy mb-2">Start a Meeting</h2>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Select meeting details and confirm client consent to begin recording
        </p>

        <div className="bg-white rounded-2xl shadow-lg border border-gold/20 p-6 space-y-6">
          {/* Meeting Type Selection */}
          <div>
            <label className="text-xs font-semibold text-gold/70 mb-2 block uppercase tracking-wide">
              Meeting Type
            </label>
            <Select
              value={selectedMeetingType}
              onValueChange={onMeetingTypeChange}
            >
              <SelectTrigger className="w-full h-12 bg-white border border-gold/30 text-sm px-4 focus:ring-2 focus:ring-gold focus:border-gold rounded-xl">
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gold/30">
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
            <label className="text-xs font-semibold text-gold/70 mb-2 block uppercase tracking-wide">
              Transcript Template
            </label>
            <Select
              value={selectedTranscript}
              onValueChange={onTranscriptChange}
            >
              <SelectTrigger className="w-full h-12 bg-white border border-gold/30 text-sm px-4 focus:ring-2 focus:ring-gold focus:border-gold rounded-xl">
                <SelectValue placeholder="Select transcript" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gold/30">
                {availableTranscripts.map((transcript) => (
                  <SelectItem key={transcript.id} value={transcript.id} className="text-sm">
                    {transcript.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consent Checkbox */}
          <div className="p-4 rounded-xl bg-offwhite border border-gold/30 shadow-sm">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={hasConsent}
                onCheckedChange={(checked) => setHasConsent(checked === true)}
                className="mt-0.5 border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-white"
              />
              <label
                htmlFor="consent"
                className="text-sm text-navy leading-relaxed cursor-pointer"
              >
                I confirm that the client has consented to being recorded and understands the privacy policy.
              </label>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedMeetingType ? 'bg-gold' : 'bg-gray-200'}`}>
                {selectedMeetingType && <CheckCircle className="w-4 h-4 text-white" strokeWidth={2} />}
              </div>
              <span className={selectedMeetingType ? 'text-navy font-medium' : 'text-muted-foreground'}>
                Meeting type selected
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedTranscript ? 'bg-gold' : 'bg-gray-200'}`}>
                {selectedTranscript && <CheckCircle className="w-4 h-4 text-white" strokeWidth={2} />}
              </div>
              <span className={selectedTranscript ? 'text-navy font-medium' : 'text-muted-foreground'}>
                Transcript selected
              </span>
            </div>
          </div>

          {/* Record Meeting Button */}
          <Button
            onClick={onStartRecording}
            disabled={!canRecord}
            size="lg"
            className="w-full h-14 bg-navy text-white text-base font-semibold hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl mt-4 shadow-md"
          >
            <Mic className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Start Recording
          </Button>
        </div>
      </div>
    </div>
  );
}