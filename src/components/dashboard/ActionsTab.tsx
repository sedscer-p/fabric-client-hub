import { User, Briefcase } from 'lucide-react';
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
    <li className="flex items-start gap-3 py-2">
      <span className="text-foreground/60 mt-1">•</span>
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
    </li>
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
            <ul className="space-y-1">
              {clientItems.map((action) => (
                <ActionItemRow key={action.id} action={action} />
              ))}
            </ul>
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
            <ul className="space-y-1">
              {advisorItems.map((action) => (
                <ActionItemRow key={action.id} action={action} />
              ))}
            </ul>
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
