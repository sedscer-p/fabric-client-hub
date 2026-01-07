import { CheckCircle2, Clock, User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionItem } from '@/data/mockData';
import { format, parseISO } from 'date-fns';

interface ActionsTabProps {
  clientActions?: ActionItem[];
  advisorActions?: ActionItem[];
}

function ActionItemRow({ action }: { action: ActionItem }) {
  const isComplete = action.status === 'complete';

  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-start gap-3 flex-1">
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        ) : (
          <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`text-sm ${isComplete ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
            {action.text}
          </p>
          {action.dueDate && !isComplete && (
            <p className="text-xs text-muted-foreground mt-1">
              Due: {format(parseISO(action.dueDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>
      <span className={`status-chip ${isComplete ? 'status-chip-complete' : 'status-chip-pending'}`}>
        {isComplete ? 'Complete' : 'Pending'}
      </span>
    </div>
  );
}

export function ActionsTab({ clientActions = [], advisorActions = [] }: ActionsTabProps) {
  const clientItems = clientActions;
  const advisorItems = advisorActions;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Client Actions */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Client Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientItems.length > 0 ? (
            <div className="divide-y divide-border">
              {clientItems.map((action) => (
                <ActionItemRow key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No client actions at this time.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Advisor Actions */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="w-5 h-5 text-primary" />
            Advisor Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {advisorItems.length > 0 ? (
            <div className="divide-y divide-border">
              {advisorItems.map((action) => (
                <ActionItemRow key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No advisor actions at this time.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
