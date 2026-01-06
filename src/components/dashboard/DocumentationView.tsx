import { FileText, Target, TrendingDown, Clock } from 'lucide-react';
import { clientDocumentation, summaryPoints } from '@/data/mockData';

interface DocumentationViewProps {
  clientId: string;
}

export function DocumentationView({ clientId }: DocumentationViewProps) {
  const documentation = clientDocumentation[clientId];
  const summary = summaryPoints[clientId] || [];

  if (!documentation) {
    return (
      <div className="px-12 pb-12">
        <p className="text-muted-foreground text-sm">No documentation available for this client.</p>
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
    <div className="px-12 pb-12 max-w-[800px]">
      {/* Key Client Documentation */}
      <section>
        <h2 className="section-header mb-4">Key Client Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentItems.map((item) => (
            <div key={item.label} className="card-minimal">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="label-text">{item.label}</span>
              </div>
              <p className="text-sm text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Previous Meeting Summary */}
      <section className="mt-8">
        <h2 className="section-header mb-4">Previous Meeting Summary</h2>
        <ul className="space-y-3">
          {summary.map((point) => (
            <li key={point.id} className="flex items-start gap-3">
              <div className="bullet-accent" />
              <span className="text-sm text-foreground">{point.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
