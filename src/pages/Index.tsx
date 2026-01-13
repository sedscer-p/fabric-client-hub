import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { HomePage } from '@/components/dashboard/HomePage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { MeetingNotesView } from '@/components/dashboard/MeetingNotesView';
import { StartMeetingView } from '@/components/dashboard/StartMeetingView';
import { RecordingOverlay, RecordingState } from '@/components/dashboard/RecordingOverlay';
import { Client, ViewType, meetingTypes, MeetingNote, clients } from '@/data/mockData';
import { processMeeting, saveMeetingNote, getAllMeetings, ActionItem } from '@/services/api';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('');
  const [selectedTranscript, setSelectedTranscript] = useState<string>('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [meetingSummary, setMeetingSummary] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [meetingId, setMeetingId] = useState<string>('');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [clientMeetingNotes, setClientMeetingNotes] = useState<Record<string, MeetingNote[]>>({});
  const [clientActions, setClientActions] = useState<ActionItem[]>([]);
  const [advisorActions, setAdvisorActions] = useState<ActionItem[]>([]);
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [summaryAccepted, setSummaryAccepted] = useState(false);

  // Load existing meetings on component mount
  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const response = await getAllMeetings();
        setClientMeetingNotes(response.meetingNotes);
        console.log('Loaded existing meetings from data folder');
      } catch (error) {
        console.error('Failed to load meetings:', error);
        // Fail silently - meetings will be empty
      }
    };

    loadMeetings();
  }, []);

  const handleStartRecording = () => {
    setRecordingState('recording');
    setMeetingSummary('');
    setSummaryAccepted(false);
  };

  const handleStopRecording = async () => {
    if (!selectedClient) return;

    setRecordingState('processing');
    setProcessingError(null);

    try {
      // Call backend API to process meeting and generate summary
      const result = await processMeeting({
        clientId: selectedClient.id,
        meetingType: selectedMeetingType,
        transcriptFile: selectedTranscript,
        duration: 180, // Recording duration in seconds (mock value)
      });

      // Store results in state
      setMeetingSummary(result.summary);
      setTranscription(result.transcription);
      setMeetingId(result.meetingId);

      // Convert actions from string arrays to ActionItem arrays
      const clientActionsData: ActionItem[] = (result.structuredData?.client_actions || []).map((text, index) => ({
        id: `client-${index + 1}`,
        text,
        status: 'pending' as const,
      }));

      const advisorActionsData: ActionItem[] = (result.structuredData?.adviser_actions || []).map((text, index) => ({
        id: `advisor-${index + 1}`,
        text,
        status: 'pending' as const,
      }));

      setClientActions(clientActionsData);
      setAdvisorActions(advisorActionsData);
      setRecordingState('complete');

      // Capture the date that will be used for saving
      setMeetingDate(new Date().toISOString());
    } catch (error: any) {
      console.error('Failed to process meeting:', error);
      const errorMessage = error.message || 'Failed to process meeting';
      setProcessingError(errorMessage);
      setRecordingState('idle');
      setSummaryAccepted(false);
      toast.error(errorMessage);
    }
  };

  const handleAcceptSummary = async () => {
    if (!selectedClient || !meetingId) return;

    try {
      const meetingTypeLabel = meetingTypes.find(t => t.id === selectedMeetingType)?.label || selectedMeetingType;
      const newMeetingNote: MeetingNote = {
        id: meetingId,
        date: meetingDate,
        type: meetingTypeLabel,
        summary: meetingSummary,
        transcription: transcription,
        hasAudio: true,
        clientActions,
        advisorActions,
      };

      // Add to local state immediately
      setClientMeetingNotes(prev => ({
        ...prev,
        [selectedClient.id]: [newMeetingNote, ...(prev[selectedClient.id] || [])]
      }));

      // Save meeting note to backend
      await saveMeetingNote({
        clientId: selectedClient.id,
        meetingId: meetingId,
        meetingType: meetingTypeLabel,
        summary: meetingSummary,
        transcription: transcription,
        date: meetingDate,
        hasAudio: true,
        clientActions,
        advisorActions,
      });

      console.log('Meeting note saved successfully');

      // Reset state and navigate
      setRecordingState('idle');
      setMeetingSummary('');
      setTranscription('');
      setMeetingId('');
      setSelectedMeetingType('');
      setActiveView('meeting-notes');
      setSummaryAccepted(false);
    } catch (error: any) {
      console.error('Failed to save meeting:', error);
      // TODO: Show error toast notification
    }
  };


  const getMeetingTypeLabel = () => {
    return meetingTypes.find(t => t.id === selectedMeetingType)?.label || '';
  };

  const isMeetingActive = recordingState !== 'idle';

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setActiveView('meeting-notes');
    }
  };

  const renderView = () => {
    // Show client selection if no client selected
    if (!selectedClient) {
      return <HomePage onClientSelect={handleClientSelect} />;
    }

    // Show recording overlay if meeting is active
    if (isMeetingActive) {
      return (
        <RecordingOverlay
          state={recordingState}
          meetingType={getMeetingTypeLabel()}
          meetingTypeId={selectedMeetingType}
          onStopRecording={handleStopRecording}
          onAcceptSummary={handleAcceptSummary}
          meetingSummary={meetingSummary}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          clientEmail={selectedClient.email}
          advisorName={selectedClient.advisor}
          meetingId={meetingId}
          meetingDate={meetingDate}
          transcription={transcription}
          summaryAccepted={summaryAccepted}
          onSummaryAcceptedChange={setSummaryAccepted}
        />
      );
    }

    // Render view based on active tab
    switch (activeView) {
      case 'home':
        return <HomePage onClientSelect={handleClientSelect} />;
      case 'meeting-notes':
        return (
          <>
            <MeetingNotesView
              clientId={selectedClient.id}
              meetingNotes={clientMeetingNotes[selectedClient.id] || []}
              clientName={selectedClient.name}
              clientEmail={selectedClient.email}
              advisorName={selectedClient.advisor}
            />
            <div className="fixed bottom-20 right-6 text-xs text-gray-300 font-mono pointer-events-none">
              v0.1
            </div>
          </>
        );
      case 'start-meeting':
        return (
          <>
            <StartMeetingView
              clientId={selectedClient.id}
              selectedMeetingType={selectedMeetingType}
              onMeetingTypeChange={setSelectedMeetingType}
              selectedTranscript={selectedTranscript}
              onTranscriptChange={setSelectedTranscript}
              onStartRecording={handleStartRecording}
            />
            <div className="fixed bottom-20 right-6 text-xs text-gray-300 font-mono pointer-events-none">
              v0.1
            </div>
          </>
        );
      case 'settings':
        return (
          <>
            <SettingsPage />
            <div className="fixed bottom-20 right-6 text-xs text-gray-300 font-mono pointer-events-none">
              v0.1
            </div>
          </>
        );
      default:
        return <HomePage onClientSelect={handleClientSelect} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-offwhite max-w-md mx-auto">
      {/* Header with Logo and Client Context */}
      {selectedClient ? (
        <div className="px-6 pt-6 pb-4 bg-white border-b border-gold/20">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <div className="text-xs text-gold font-semibold tracking-wide">CLIENT SELECTED</div>
              <div className="text-lg font-serif font-bold text-navy">{selectedClient.name}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-4 bg-white border-b border-gold/20">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <div className="text-xs text-gold font-semibold tracking-wide">FABRIC AI</div>
              <div className="text-lg font-serif font-bold text-navy">Client Hub</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>

      {/* Bottom Navigation - Only show if client is selected */}
      {selectedClient && (
        <BottomNav
          activeTab={activeView}
          onTabChange={(tab) => {
            if (tab === 'home') {
              // Reset client selection and go to home
              setSelectedClient(null);
              setActiveView('home');
            } else {
              setActiveView(tab as ViewType);
            }
          }}
        />
      )}
    </div>
  );
};

export default Index;
