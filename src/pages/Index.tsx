import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainPanel } from '@/components/dashboard/MainPanel';
import { Client, ViewType, meetingTypes } from '@/data/mockData';
import { RecordingState } from '@/components/dashboard/RecordingOverlay';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('documentation');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [meetingSummary, setMeetingSummary] = useState<string>('');

  const handleStartRecording = () => {
    setRecordingState('recording');
    setMeetingSummary('');
  };

  const handleStopRecording = () => {
    setRecordingState('processing');
    setTimeout(() => {
      setRecordingState('complete');
      setMeetingSummary(`Meeting Summary - ${meetingTypes.find(t => t.id === selectedMeetingType)?.label || 'Meeting'}

Key Discussion Points:
• Reviewed current portfolio allocation and performance metrics
• Discussed upcoming market conditions and potential adjustments
• Addressed client questions regarding retirement timeline
• Reviewed beneficiary designations and estate planning updates

Action Items:
• Schedule follow-up call to discuss proposed rebalancing strategy
• Send updated risk tolerance questionnaire for client review
• Prepare comparative analysis of alternative investment options
• Update client file with new contact information

Next Steps:
Client expressed satisfaction with current strategy. Will reconvene in 30 days to finalize any portfolio adjustments based on Q1 performance data.`);
    }, 3000);
  };

  const handleAcceptSummary = (selectedDocuments: string[]) => {
    console.log('Summary accepted with documents:', selectedDocuments);
    // Reset meeting state
    setRecordingState('idle');
    setMeetingSummary('');
    setSelectedMeetingType('');
    setActiveView('documentation');
  };

  const handleClientSelect = (client: Client | null) => {
    // If changing client during active meeting, reset everything
    if (recordingState !== 'idle' && client?.id !== selectedClient?.id) {
      setRecordingState('idle');
      setMeetingSummary('');
      setSelectedMeetingType('');
    }
    setSelectedClient(client);
    setActiveView('documentation');
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
          meetingSummary={meetingSummary}
        />
      </div>
    </div>
  );
};

export default Index;
