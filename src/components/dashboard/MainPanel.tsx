import { Client, ViewType } from '@/data/mockData';
import { ClientHeader } from './ClientHeader';
import { DocumentationView } from './DocumentationView';
import { MeetingNotesView } from './MeetingNotesView';
import { MeetingPrepView } from './MeetingPrepView';
import { RecordingOverlay, RecordingState } from './RecordingOverlay';
import { AskBar } from './AskBar';

interface MainPanelProps {
  client: Client | null;
  activeView: ViewType;
  recordingState: RecordingState;
  meetingType: string;
  onStopRecording: () => void;
  meetingSummary: string;
  showMeetingView: boolean;
}

export function MainPanel({ 
  client, 
  activeView, 
  recordingState, 
  meetingType, 
  onStopRecording,
  meetingSummary,
  showMeetingView
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
      
      {/* Ask Bar - Always accessible */}
      <AskBar clientId={client.id} />
      
      <div className="flex-1 overflow-auto">
        {/* During meeting with meeting view selected: show recording overlay */}
        {isMeetingActive && showMeetingView && (
          <div className="main-content">
            <RecordingOverlay 
              state={recordingState}
              meetingType={meetingType}
              onStopRecording={onStopRecording}
              meetingSummary={meetingSummary}
            />
          </div>
        )}

        {/* During meeting with client view selected OR before meeting: show client views */}
        {(!isMeetingActive || !showMeetingView) && (
          <>
            {activeView === 'documentation' && <DocumentationView clientId={client.id} />}
            {activeView === 'meeting-notes' && <MeetingNotesView clientId={client.id} />}
            {activeView === 'meeting-prep' && <MeetingPrepView clientId={client.id} />}
          </>
        )}
      </div>
    </div>
  );
}
