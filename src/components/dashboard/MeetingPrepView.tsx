import { CheckCircle2, Circle, Calendar } from 'lucide-react';
import { meetingPrepItems } from '@/data/mockData';

interface MeetingPrepViewProps {
  clientId: string;
}

export function MeetingPrepView({ clientId }: MeetingPrepViewProps) {
  const items = meetingPrepItems[clientId] || [];
  const pendingItems = items.filter((item) => item.status === 'pending');
  const completedItems = items.filter((item) => item.status === 'complete');

  return (
    <div className="px-12 pt-12 pb-12 max-w-[800px]">
      {/* Header */}
      <section>
        <h2 className="section-header mb-1">Meeting Preparation</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Actions and changes to review from previous meetings
        </p>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No preparation items for this client.</p>
      ) : (
        <div className="space-y-8">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Circle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="label-text">Pending Follow-ups ({pendingItems.length})</span>
              </div>
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="card-minimal border-l-2 border-l-amber-500"
                  >
                    <p className="text-sm text-foreground">{item.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="caption-text">
                        From {new Date(item.fromMeetingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={1.5} />
                <span className="label-text">Completed ({completedItems.length})</span>
              </div>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="card-minimal border-l-2 border-l-green-500 opacity-60"
                  >
                    <p className="text-sm text-foreground">{item.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="caption-text">
                        From {new Date(item.fromMeetingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
