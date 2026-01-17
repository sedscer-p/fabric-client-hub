import { useState } from 'react';
import { Search } from 'lucide-react';
import { Client } from '@/data/mockData';
import { format, parseISO } from 'date-fns';

interface ClientHeaderProps {
  client: Client;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const formattedDate = format(parseISO(client.lastMeetingDate), 'MMM d');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      console.log('Searching for:', searchValue);
      // Add search functionality here
    }
  };

  return (
    <div className="px-12 pt-8 pb-6 border-b border-gold/20 bg-white">
      <div className="flex items-center justify-between gap-6 mb-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/assets/fabric-logo.png"
            alt="Fabric"
            className="h-10 w-10 object-contain"
          />
        </div>

        {/* Search Bar - Bubble Style */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
            <input
              type="text"
              placeholder="Ask about this client..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gold/30 rounded-full bg-offwhite
                       focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold
                       transition-all placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {/* Last Meeting Date */}
        <div className="flex items-center gap-1.5 text-xs text-navy bg-gold/10 px-3 py-1.5 rounded-full flex-shrink-0 font-medium">
          <span>Last: {formattedDate}</span>
        </div>
      </div>

      {/* Client Info */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-navy tracking-tight">
          {client.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Advisor: <span className="font-semibold text-navy">{client.advisor}</span>
        </p>
      </div>
    </div>
  );
}
