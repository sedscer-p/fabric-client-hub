import { useState } from 'react';
import { FileText, BookOpen, CheckSquare, MessageCircle, User, Mic, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  isMeetingActive: boolean;
  onResetMeeting?: () => void;
  showMeetingView: boolean;
  onToggleMeetingView: (show: boolean) => void;
}

export function Sidebar({ 
  selectedClient, 
  onClientSelect, 
  activeView, 
  onViewChange,
  selectedMeetingType,
  onMeetingTypeChange,
  onStartRecording,
  isRecording,
  isMeetingActive,
  onResetMeeting,
  showMeetingView,
  onToggleMeetingView
}: SidebarProps) {
  const [isClientViewExpanded, setIsClientViewExpanded] = useState(true);
  const [isMeetingExpanded, setIsMeetingExpanded] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId) || null;
    onClientSelect(client);
    setHasConsent(false);
    // Reset meeting if changing client during active meeting
    if (isMeetingActive && onResetMeeting) {
      onResetMeeting();
    }
  };

  const viewOptions = [
    { id: 'documentation' as ViewType, label: 'Documentation', icon: FileText, description: 'Client profile & key documents' },
    { id: 'meeting-notes' as ViewType, label: 'Meeting Notes', icon: BookOpen, description: 'Transcriptions & summaries' },
    { id: 'meeting-prep' as ViewType, label: 'Meeting Prep', icon: CheckSquare, description: 'Actions to follow up' },
  ];

  const handleRecordMeeting = () => {
    onStartRecording();
  };

  const canRecord = selectedMeetingType && hasConsent && !isRecording;

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

      {/* View Toggles - Shown when client is selected */}
      {selectedClient && (
        <>
          {/* During meeting: toggle between Client View and Current Meeting */}
          {isMeetingActive && (
            <div className="px-4 pb-4">
              <span className="sidebar-label">View</span>
              <div className="space-y-1 mt-2">
                <button
                  onClick={() => onToggleMeetingView(false)}
                  className={`w-full nav-item transition-fast ${
                    !showMeetingView ? 'nav-item-selected' : 'nav-item-default'
                  }`}
                >
                  <FileText className="w-[18px] h-[18px] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div className="text-left">
                    <p className={`text-sm ${!showMeetingView ? 'font-medium' : 'font-normal'}`}>
                      Client View
                    </p>
                    <p className="text-xs text-muted-foreground nav-item-description">
                      Documentation & notes
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => onToggleMeetingView(true)}
                  className={`w-full nav-item transition-fast ${
                    showMeetingView ? 'nav-item-selected' : 'nav-item-default'
                  }`}
                >
                  <Mic className="w-[18px] h-[18px] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div className="text-left">
                    <p className={`text-sm ${showMeetingView ? 'font-medium' : 'font-normal'}`}>
                      Current Meeting
                    </p>
                    <p className="text-xs text-muted-foreground nav-item-description">
                      Live recording & summary
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Client View Section - Collapsible (only before meeting) */}
          {!isMeetingActive && (
            <div className="px-4 pb-4">
              <button
                onClick={() => setIsClientViewExpanded(!isClientViewExpanded)}
                className="w-full flex items-center justify-between py-2 text-left"
              >
                <span className="sidebar-label mb-0">Client View</span>
                {isClientViewExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                )}
              </button>
              
              {isClientViewExpanded && (
                <div className="space-y-1 mt-2">
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
              )}
            </div>
          )}
        </>
      )}

      {/* Start a Meeting Section - Only shown when client is selected and meeting not active */}
      {selectedClient && !isMeetingActive && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setIsMeetingExpanded(!isMeetingExpanded)}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <span className="sidebar-label mb-0">Start a Meeting</span>
              {isMeetingExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              )}
            </button>

            {isMeetingExpanded && (
              <div className="mt-2 space-y-4">
                {/* Meeting Type Selection */}
                <div>
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

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={hasConsent}
                    onCheckedChange={(checked) => setHasConsent(checked === true)}
                    className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor="consent" 
                    className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    Client has consented to being recorded
                  </label>
                </div>

                {/* Record Meeting Button */}
                <Button 
                  onClick={handleRecordMeeting}
                  disabled={!canRecord}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {isRecording ? 'Recording...' : 'Record Meeting'}
                </Button>
              </div>
            )}
          </div>
      )}

      {/* Meeting in Progress indicator */}
      {selectedClient && isMeetingActive && (
        <div className="px-4 pb-4">
          <div className="card-minimal p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">Meeting Active</p>
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
