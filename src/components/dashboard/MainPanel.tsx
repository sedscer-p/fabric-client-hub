import { Client, ViewType, MeetingNote } from '@/data/mockData';
import { ClientHeader } from './ClientHeader';
import { DocumentationView } from './DocumentationView';
import { MeetingNotesView } from './MeetingNotesView';
import { MeetingPrepView } from './MeetingPrepView';
import { StartMeetingView } from './StartMeetingView';
import { RecordingOverlay, RecordingState } from './RecordingOverlay';

interface MainPanelProps {
  client: Client | null;
  activeView: ViewType;
  recordingState: RecordingState;
  meetingType: string;
  selectedMeetingType: string;
  onMeetingTypeChange: (type: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAcceptSummary: (selectedDocuments: string[]) => void;
  meetingSummary: string;
  clientMeetingNotes: Record<string, MeetingNote[]>;
}

export function MainPanel({
  client,
  activeView,
  recordingState,
  meetingType,
  selectedMeetingType,
  onMeetingTypeChange,
  onStartRecording,
  onStopRecording,
  onAcceptSummary,
  meetingSummary,
  clientMeetingNotes
}: MainPanelProps) {
  const isMeetingActive = recordingState !== 'idle';

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
        {activeView === 'documentation' && <DocumentationView clientId={client.id} />}
        {activeView === 'meeting-notes' && <MeetingNotesView clientId={client.id} meetingNotes={clientMeetingNotes[client.id] || []} />}
        {activeView === 'meeting-prep' && <MeetingPrepView clientId={client.id} />}
        {activeView === 'start-meeting' && !isMeetingActive && (
          <StartMeetingView
            selectedMeetingType={selectedMeetingType}
            onMeetingTypeChange={onMeetingTypeChange}
            onStartRecording={onStartRecording}
          />
        )}
        {activeView === 'start-meeting' && isMeetingActive && (
          <div className="main-content">
            <RecordingOverlay
              state={recordingState}
              meetingType={meetingType}
              meetingTypeId={selectedMeetingType}
              onStopRecording={onStopRecording}
              onAcceptSummary={onAcceptSummary}
              meetingSummary={meetingSummary}
            />
          </div>
        )}
      </div>
    </div>
  );
}
