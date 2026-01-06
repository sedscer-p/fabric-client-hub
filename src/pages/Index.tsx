import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainPanel } from '@/components/dashboard/MainPanel';
import { Client, ViewType } from '@/data/mockData';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('documentation');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar 
        selectedClient={selectedClient} 
        onClientSelect={setSelectedClient}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="ml-[260px] flex-1">
        <MainPanel client={selectedClient} activeView={activeView} />
      </div>
    </div>
  );
};

export default Index;
