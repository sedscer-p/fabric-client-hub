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
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👈</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Select a client to get started
          </h2>
          <p className="text-muted-foreground">
            Choose a client from the sidebar to view their documentation, meeting notes, and preparation items.
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
