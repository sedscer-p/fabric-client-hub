import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { clients } from '@/data/mockData';

interface HomePageProps {
  onClientSelect: (clientId: string) => void;
}

export function HomePage({ onClientSelect }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-6 pt-6 pb-24 bg-offwhite min-h-screen">
      <h1 className="text-2xl font-serif font-bold text-navy mb-2">Select Client</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Choose a client to view their previous meetings and record a new one
      </p>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-gold/30 rounded-xl bg-white
                   focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold
                   transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            onClick={() => onClientSelect(client.id)}
            className="w-full bg-white rounded-xl border border-gold/20 p-4 hover:border-gold/40 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-semibold text-navy text-lg">{client.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Advisor: {client.advisor}
                </p>
                <p className="text-xs text-gold mt-1">
                  Last meeting: {new Date(client.lastMeetingDate).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gold" />
            </div>
          </button>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No clients found
        </p>
      )}

      {/* v0.1 Watermark */}
      <div className="fixed bottom-20 right-6 text-xs text-gray-300 font-mono pointer-events-none">
        v0.1
      </div>
    </div>
  );
}
