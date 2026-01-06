import { FileText, BookOpen, ClipboardCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { clients, Client, ViewType } from '@/data/mockData';

interface SidebarProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Sidebar({ selectedClient, onClientSelect, activeView, onViewChange }: SidebarProps) {
  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId) || null;
    onClientSelect(client);
  };

  const viewOptions = [
    { id: 'documentation' as ViewType, label: 'Documentation', icon: FileText, description: 'Client profile & key documents' },
    { id: 'meeting-notes' as ViewType, label: 'Meeting Notes', icon: BookOpen, description: 'Transcriptions & summaries' },
    { id: 'meeting-prep' as ViewType, label: 'Meeting Prep', icon: ClipboardCheck, description: 'Actions to follow up' },
  ];

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

      {/* View Toggles - Only shown when client is selected */}
      {selectedClient && (
        <div className="sidebar-section border-b border-sidebar-border animate-fade-in">
          <label className="sidebar-label">Client View</label>
          <div className="space-y-2">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onViewChange(option.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeView === option.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-secondary text-foreground'
                }`}
              >
                <option.icon className={`w-5 h-5 mt-0.5 shrink-0 ${
                  activeView === option.id ? 'text-primary-foreground' : 'text-primary'
                }`} />
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className={`text-xs ${
                    activeView === option.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
