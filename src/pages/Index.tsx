import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainPanel } from '@/components/dashboard/MainPanel';
import { Client, ViewType, meetingTypes, MeetingNote } from '@/data/mockData';
import { RecordingState } from '@/components/dashboard/RecordingOverlay';
import { processMeeting, saveMeetingNote, generateDiscoveryReport, getAllMeetings, ActionItem } from '@/services/api';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('meeting-notes');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [meetingSummary, setMeetingSummary] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [meetingId, setMeetingId] = useState<string>('');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [clientMeetingNotes, setClientMeetingNotes] = useState<Record<string, MeetingNote[]>>({});
  const [clientActions, setClientActions] = useState<ActionItem[]>([]);
  const [advisorActions, setAdvisorActions] = useState<ActionItem[]>([]);

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
    } catch (error: any) {
      console.error('Failed to process meeting:', error);
      setProcessingError(error.message || 'Failed to process meeting');
      setRecordingState('idle');
      // TODO: Show error toast notification
    }
  };

  const handleAcceptSummary = async () => {
    if (!selectedClient || !meetingId) return;

    try {
      const meetingTypeLabel = meetingTypes.find(t => t.id === selectedMeetingType)?.label || selectedMeetingType;
      const newMeetingNote: MeetingNote = {
        id: meetingId,
        date: new Date().toISOString(),
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
        date: newMeetingNote.date,
        hasAudio: true,
        clientActions,
        advisorActions,
      });

      console.log('Meeting note saved successfully');

      // If not a discovery meeting, reset and navigate
      if (selectedMeetingType !== 'discovery') {
        setRecordingState('idle');
        setMeetingSummary('');
        setTranscription('');
        setMeetingId('');
        setSelectedMeetingType('');
        setActiveView('meeting-notes');
      }
      // For discovery meetings, keep state and show report option
    } catch (error: any) {
      console.error('Failed to save meeting:', error);
      // TODO: Show error toast notification
    }
  };

  const handleGenerateDiscoveryReport = async () => {
    if (!selectedClient || !meetingId) return;

    try {
      const meetingTypeLabel = meetingTypes.find(t => t.id === selectedMeetingType)?.label || selectedMeetingType;
      const meetingDate = clientMeetingNotes[selectedClient.id]?.[0]?.date || new Date().toISOString();

      await generateDiscoveryReport({
        clientId: selectedClient.id,
        meetingId: meetingId,
        transcription: transcription,
        meetingDate: meetingDate,
        meetingType: meetingTypeLabel,
      });

      console.log('Discovery report generated successfully');
      // TODO: Navigate to discovery report view or show success message

      // Reset state and navigate to meeting-notes view
      setRecordingState('idle');
      setMeetingSummary('');
      setTranscription('');
      setMeetingId('');
      setSelectedMeetingType('');
      setActiveView('meeting-notes');
    } catch (error: any) {
      console.error('Failed to generate discovery report:', error);
      // TODO: Show error toast notification
    }
  };

  const handleSkipReport = () => {
    // Meeting already saved, just reset state and navigate
    setRecordingState('idle');
    setMeetingSummary('');
    setTranscription('');
    setMeetingId('');
    setSelectedMeetingType('');
    setActiveView('meeting-notes');
  };

  const handleClientSelect = (client: Client | null) => {
    // If changing client during active meeting, reset everything
    if (recordingState !== 'idle' && client?.id !== selectedClient?.id) {
      setRecordingState('idle');
      setMeetingSummary('');
      setSelectedMeetingType('');
    }
    setSelectedClient(client);
    setActiveView('meeting-notes');
  };

  const getMeetingTypeLabel = () => {
    return meetingTypes.find(t => t.id === selectedMeetingType)?.label || '';
  };

  const isMeetingActive = recordingState !== 'idle';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar 
        selectedClient={selectedClient} 
        onClientSelect={handleClientSelect}
        activeView={activeView}
        onViewChange={setActiveView}
        selectedMeetingType={selectedMeetingType}
        recordingState={recordingState}
        isMeetingActive={isMeetingActive}
      />
      <div className="ml-[260px] flex-1">
        <MainPanel
          client={selectedClient}
          activeView={activeView}
          recordingState={recordingState}
          meetingType={getMeetingTypeLabel()}
          selectedMeetingType={selectedMeetingType}
          onMeetingTypeChange={setSelectedMeetingType}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onAcceptSummary={handleAcceptSummary}
          onGenerateDiscoveryReport={handleGenerateDiscoveryReport}
          onSkipReport={handleSkipReport}
          meetingSummary={meetingSummary}
          clientMeetingNotes={clientMeetingNotes}
        />
      </div>
    </div>
  );
};

export default Index;
