import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainPanel } from '@/components/dashboard/MainPanel';
import { Client } from '@/data/mockData';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar 
        selectedClient={selectedClient} 
        onClientSelect={setSelectedClient} 
      />
      <div className="ml-[280px] flex-1">
        <MainPanel client={selectedClient} />
      </div>
    </div>
  );
};

export default Index;
