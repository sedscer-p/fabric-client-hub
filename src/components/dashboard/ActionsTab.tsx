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
      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isComplete ? 'bg-gold' : 'bg-gold/60'}`} />
      <div className="flex-1">
        <p className={`text-sm ${isComplete ? 'text-muted-foreground line-through' : 'text-navy'}`}>
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
      <Card className="shadow-sm border-t-2 border-t-gold rounded-lg">
        <CardHeader className="pb-4 border-b border-gold/10">
          <CardTitle className="flex items-center gap-2 text-base font-serif font-semibold text-navy">
            <User className="w-5 h-5 text-gold" />
            Client Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
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
      <Card className="shadow-sm border-t-2 border-t-gold rounded-lg">
        <CardHeader className="pb-4 border-b border-gold/10">
          <CardTitle className="flex items-center gap-2 text-base font-serif font-semibold text-navy">
            <Briefcase className="w-5 h-5 text-gold" />
            Advisor Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
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
