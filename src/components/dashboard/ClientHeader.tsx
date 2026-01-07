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
    <div className="px-12 pt-12 pb-6 border-b border-border">
      <div className="flex items-center justify-between gap-6">
        {/* Client Info */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {client.name}
          </h1>
          <p className="mt-1 text-sm text-secondary-foreground">
            Advisor: {client.advisor}
          </p>
        </div>

        {/* Search Bar - Bubble Style */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ask about this client..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-transparent rounded-full
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                       transition-all placeholder:text-muted-foreground"
              style={{ backgroundColor: 'hsl(var(--accent-subtle))' }}
            />
          </div>
        </form>

        {/* Last Meeting Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full flex-shrink-0">
          <span>Last: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
