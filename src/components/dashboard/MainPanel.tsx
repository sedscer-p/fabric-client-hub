import { Client, ViewType } from '@/data/mockData';
import { ClientHeader } from './ClientHeader';
import { DocumentationView } from './DocumentationView';
import { MeetingNotesView } from './MeetingNotesView';
import { MeetingPrepView } from './MeetingPrepView';
import { AskTab } from './AskTab';

interface MainPanelProps {
  client: Client | null;
  activeView: ViewType;
}

export function MainPanel({ client, activeView }: MainPanelProps) {
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
        {activeView === 'meeting-notes' && <MeetingNotesView clientId={client.id} />}
        {activeView === 'meeting-prep' && <MeetingPrepView clientId={client.id} />}
        {activeView === 'ask' && <AskTab clientId={client.id} />}
      </div>
    </div>
  );
}
