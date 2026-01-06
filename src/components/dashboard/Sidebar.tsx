import { useState, useEffect } from 'react';
import { Mic, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clients, meetingTypes, Client } from '@/data/mockData';

interface SidebarProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
}

export function Sidebar({ selectedClient, onClientSelect }: SidebarProps) {
  const [meetingType, setMeetingType] = useState<string>('');

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId) || null;
    onClientSelect(client);
    setMeetingType('');
  };

  const isRecordEnabled = selectedClient && meetingType;

  return (
    <aside className="w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">Fabric</span>
        </div>
      </div>

      {/* Client Selection */}
      <div className="sidebar-section border-b border-sidebar-border">
        <label className="sidebar-label">Select Client</label>
        <Select
          value={selectedClient?.id || ''}
          onValueChange={handleClientChange}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Choose a client..." />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Meeting Type - Only shown when client is selected */}
      {selectedClient && (
        <div className="sidebar-section border-b border-sidebar-border animate-fade-in">
          <label className="sidebar-label">Meeting Type</label>
          <Select value={meetingType} onValueChange={setMeetingType}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select meeting type..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {meetingTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Record Meeting Button */}
      <div className="sidebar-section">
        <Button
          className="w-full gap-2"
          disabled={!isRecordEnabled}
        >
          <Mic className="w-4 h-4" />
          Record Meeting
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="sidebar-section border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          Fabric v1.0 • Client Portal
        </p>
      </div>
    </aside>
  );
}
