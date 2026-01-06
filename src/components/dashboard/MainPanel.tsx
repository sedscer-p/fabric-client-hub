import { Client, ViewType } from '@/data/mockData';
import { ClientHeader } from './ClientHeader';
import { DocumentationView } from './DocumentationView';
import { MeetingNotesView } from './MeetingNotesView';
import { MeetingPrepView } from './MeetingPrepView';
import { AskTab } from './AskTab';
import { RecordingOverlay, RecordingState } from './RecordingOverlay';

interface MainPanelProps {
  client: Client | null;
  activeView: ViewType;
  recordingState: RecordingState;
  meetingType: string;
  onStopRecording: () => void;
  meetingSummary: string;
}

export function MainPanel({ 
  client, 
  activeView, 
  recordingState, 
  meetingType, 
  onStopRecording,
  meetingSummary 
}: MainPanelProps) {
  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
        <div className="text-center max-w-sm">
          <p className="text-muted-foreground text-sm">
            Select a client to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <ClientHeader client={client} />
      <div className="flex-1 overflow-auto">
        <div className="main-content">
          <RecordingOverlay 
            state={recordingState}
            meetingType={meetingType}
            onStopRecording={onStopRecording}
            meetingSummary={meetingSummary}
          />
        </div>
        {activeView === 'documentation' && <DocumentationView clientId={client.id} />}
        {activeView === 'meeting-notes' && <MeetingNotesView clientId={client.id} />}
        {activeView === 'meeting-prep' && <MeetingPrepView clientId={client.id} />}
        {activeView === 'ask' && <AskTab clientId={client.id} />}
      </div>
    </div>
  );
}
