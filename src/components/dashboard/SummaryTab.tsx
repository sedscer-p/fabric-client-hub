import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { summaryPoints, SummaryPoint } from '@/data/mockData';

interface SummaryTabProps {
  clientId: string;
}

export function SummaryTab({ clientId }: SummaryTabProps) {
  const points = summaryPoints[clientId] || [];

  return (
    <div className="p-6 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Meeting Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {points.length > 0 ? (
            <ul className="space-y-3">
              {points.map((point, index) => (
                <li key={point.id} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-card-foreground leading-relaxed">
                    {point.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No meeting summaries available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
