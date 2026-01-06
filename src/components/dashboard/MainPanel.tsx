import { useState } from 'react';
import { Client } from '@/data/mockData';
import { ClientHeader } from './ClientHeader';
import { TabNavigation, TabType } from './TabNavigation';
import { SummaryTab } from './SummaryTab';
import { ActionsTab } from './ActionsTab';
import { AskTab } from './AskTab';

interface MainPanelProps {
  client: Client | null;
}

export function MainPanel({ client }: MainPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

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
            Choose a client from the sidebar to view their meeting history, action items, and ask questions about their account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <ClientHeader client={client} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {activeTab === 'summary' && <SummaryTab clientId={client.id} />}
        {activeTab === 'actions' && <ActionsTab clientId={client.id} />}
        {activeTab === 'ask' && <AskTab clientId={client.id} />}
      </div>
    </div>
  );
}
