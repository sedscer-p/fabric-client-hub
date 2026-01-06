import { FileText, BookOpen, CheckSquare, MessageCircle, User, Mic, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { clients, Client, ViewType, meetingTypes } from '@/data/mockData';

interface SidebarProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedMeetingType: string;
  onMeetingTypeChange: (type: string) => void;
  onStartRecording: () => void;
  isRecording: boolean;
}

export function Sidebar({ 
  selectedClient, 
  onClientSelect, 
  activeView, 
  onViewChange,
  selectedMeetingType,
  onMeetingTypeChange,
  onStartRecording,
  isRecording
}: SidebarProps) {
  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId) || null;
    onClientSelect(client);
  };

  const viewOptions = [
    { id: 'documentation' as ViewType, label: 'Documentation', icon: FileText, description: 'Client profile & key documents' },
    { id: 'meeting-notes' as ViewType, label: 'Meeting Notes', icon: BookOpen, description: 'Transcriptions & summaries' },
    { id: 'meeting-prep' as ViewType, label: 'Meeting Prep', icon: CheckSquare, description: 'Actions to follow up' },
    { id: 'ask' as ViewType, label: 'Ask', icon: MessageCircle, description: 'Query client & regulatory info' },
  ];

  const handleRecordMeeting = () => {
    onStartRecording();
  };

  return (
    <aside className="w-[260px] h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-4 py-6">
        <span className="text-xl font-semibold text-foreground">ProcessWise</span>
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

      {/* View Toggles - Only shown when client is selected */}
      {selectedClient && (
        <>
          <div className="px-4 pb-6">
            <p className="sidebar-label">Client View</p>
            <div className="space-y-1">
              {viewOptions.map((option) => {
                const isSelected = activeView === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => onViewChange(option.id)}
                    className={`w-full nav-item transition-fast ${
                      isSelected ? 'nav-item-selected' : 'nav-item-default'
                    }`}
                  >
                    <option.icon 
                      className="w-[18px] h-[18px] mt-0.5 shrink-0" 
                      strokeWidth={1.5}
                    />
                    <div className="text-left">
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

          {/* Meeting Type Selection */}
          <div className="px-4 pb-4">
            <p className="sidebar-label">Choose Meeting Type</p>
            <Select
              value={selectedMeetingType}
              onValueChange={onMeetingTypeChange}
            >
              <SelectTrigger className="w-full h-10 bg-card border-border text-sm font-normal px-3 focus:ring-2 focus:ring-offset-0 focus:ring-accent-subtle focus:border-primary">
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

          {/* Record Meeting Button */}
          <div className="px-4 pb-6">
            <Button 
              onClick={handleRecordMeeting}
              disabled={!selectedMeetingType || isRecording}
              className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {isRecording ? 'Recording...' : 'Record Meeting'}
            </Button>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Fabric v1.0
        </p>
      </div>
    </aside>
  );
}
