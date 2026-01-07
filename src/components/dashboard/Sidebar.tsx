import { BookOpen, CheckSquare, User, Mic, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clients, Client, ViewType, meetingTypes } from '@/data/mockData';
import { RecordingState } from './RecordingOverlay';

interface SidebarProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedMeetingType: string;
  recordingState: RecordingState;
  isMeetingActive: boolean;
}

export function Sidebar({ 
  selectedClient, 
  onClientSelect, 
  activeView, 
  onViewChange,
  selectedMeetingType,
  recordingState,
  isMeetingActive
}: SidebarProps) {

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId) || null;
    onClientSelect(client);
  };

  const viewOptions = [
    { id: 'meeting-notes' as ViewType, label: 'Meeting Notes', icon: BookOpen, description: 'Transcriptions & summaries' },
    { id: 'meeting-prep' as ViewType, label: 'Meeting Prep', icon: CheckSquare, description: 'Actions to follow up' },
    { id: 'start-meeting' as ViewType, label: isMeetingActive ? 'Current Meeting' : 'Start a Meeting', icon: Mic, description: isMeetingActive ? 'Live recording & summary' : 'Begin a new recording' },
  ];

  return (
    <aside className="w-[260px] h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-4 py-6">
        <span className="text-xl font-semibold text-foreground">Fabric</span>
        <span className="text-xs text-muted-foreground ml-2">v0.1</span>
      </div>

      {/* Client Selection */}
      <div className="px-4 pb-6">
        <Select
          value={selectedClient?.id || ''}
          onValueChange={handleClientChange}
        >
          <SelectTrigger className="w-full h-10 bg-card border-border text-sm font-normal px-3 focus:ring-2 focus:ring-offset-0 focus:ring-accent-subtle focus:border-primary">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <SelectValue placeholder="Select Client" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} className="text-sm">
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation - Flat list */}
      {selectedClient && (
        <div className="px-4 pb-4">
          <div className="space-y-1">
            {viewOptions.map((option) => {
              const isSelected = activeView === option.id;
              const showRecordingDot = option.id === 'start-meeting' && recordingState === 'recording';
              
              return (
                <button
                  key={option.id}
                  onClick={() => onViewChange(option.id)}
                  className={`w-full nav-item transition-fast ${
                    isSelected ? 'nav-item-selected' : 'nav-item-default'
                  }`}
                >
                  <div className="relative">
                    <option.icon 
                      className="w-[18px] h-[18px] mt-0.5 shrink-0" 
                      strokeWidth={1.5}
                    />
                    {showRecordingDot && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground nav-item-description">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Meeting status indicator */}
      {selectedClient && isMeetingActive && (
        <div className="px-4 pb-4">
          <div className="card-minimal p-3">
            <div className="flex items-center gap-3">
              {recordingState === 'recording' && (
                <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
              )}
              {recordingState === 'processing' && (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              )}
              {recordingState === 'complete' && (
                <CheckCircle className="w-4 h-4 text-primary" strokeWidth={1.5} />
              )}
              <div>
                <p className="text-xs font-medium text-foreground">
                  {recordingState === 'recording' && 'Recording in progress'}
                  {recordingState === 'processing' && 'Processing recording...'}
                  {recordingState === 'complete' && 'Meeting complete'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {meetingTypes.find(t => t.id === selectedMeetingType)?.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Fabric v0.1
        </p>
      </div>
    </aside>
  );
}
