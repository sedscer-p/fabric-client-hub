import { CheckCircle2, Circle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { meetingPrepItems } from '@/data/mockData';

interface MeetingPrepViewProps {
  clientId: string;
}

export function MeetingPrepView({ clientId }: MeetingPrepViewProps) {
  const items = meetingPrepItems[clientId] || [];
  const pendingItems = items.filter((item) => item.status === 'pending');
  const completedItems = items.filter((item) => item.status === 'complete');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Meeting Preparation</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Actions and changes to review from previous meetings
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No preparation items for this client.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Pending Follow-ups ({pendingItems.length})
              </h3>
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <Card key={item.id} className="bg-card border-border border-l-4 border-l-amber-500">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-foreground">{item.text}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            From meeting on {new Date(item.fromMeetingDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Completed ({completedItems.length})
              </h3>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <Card key={item.id} className="bg-card border-border border-l-4 border-l-green-500 opacity-75">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-foreground">{item.text}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            From meeting on {new Date(item.fromMeetingDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          Complete
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
