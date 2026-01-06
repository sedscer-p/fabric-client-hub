import { FileText, Target, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clientDocumentation, summaryPoints } from '@/data/mockData';

interface DocumentationViewProps {
  clientId: string;
}

export function DocumentationView({ clientId }: DocumentationViewProps) {
  const documentation = clientDocumentation[clientId];
  const summary = summaryPoints[clientId] || [];

  if (!documentation) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No documentation available for this client.</p>
      </div>
    );
  }

  const documentItems = [
    { icon: Target, label: 'Risk Tolerance', value: documentation.riskTolerance },
    { icon: FileText, label: 'Financial Objective', value: documentation.financialObjective },
    { icon: TrendingDown, label: 'Capacity for Loss', value: documentation.capacityForLoss },
    { icon: Clock, label: 'Investment Horizon', value: documentation.investmentHorizon },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Key Client Documentation</h2>
        <div className="grid gap-4">
          {documentItems.map((item) => (
            <Card key={item.label} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Previous Meeting Summary</h2>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {summary.map((point) => (
                <li key={point.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <span className="text-foreground">{point.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
