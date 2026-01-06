import { Calendar, User, Mail } from 'lucide-react';
import { Client } from '@/data/mockData';
import { format, parseISO } from 'date-fns';

interface ClientHeaderProps {
  client: Client;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const formattedDate = format(parseISO(client.lastMeetingDate), 'MMMM d, yyyy');

  return (
    <div className="bg-card border-b border-border px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">
            {client.name}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Advisor: {client.advisor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>{client.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <Calendar className="w-4 h-4" />
          <span>Last meeting: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
