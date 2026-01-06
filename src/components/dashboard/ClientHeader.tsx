import { User } from 'lucide-react';
import { Client } from '@/data/mockData';
import { format, parseISO } from 'date-fns';

interface ClientHeaderProps {
  client: Client;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const formattedDate = format(parseISO(client.lastMeetingDate), 'MMM d');

  return (
    <div className="px-12 pt-12 pb-6">
      <div className="flex items-start justify-between max-w-[800px]">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {client.name}
          </h1>
          <p className="mt-1 text-sm text-secondary-foreground">
            Advisor: {client.advisor}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <span>Last: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
