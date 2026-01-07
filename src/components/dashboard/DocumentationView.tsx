import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { clientDocumentation, summaryPoints } from '@/data/mockData';

interface DocumentationViewProps {
  clientId: string;
}

export function DocumentationView({ clientId }: DocumentationViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const documentation = clientDocumentation[clientId];
  const summary = summaryPoints[clientId] || [];

  if (!documentation) {
    return (
      <div className="px-12 pb-12">
        <p className="text-muted-foreground text-sm">No documentation available for this client.</p>
      </div>
    );
  }

  return (
    <div className="px-12 pt-12 pb-8">
      {/* Client Background Document Tile */}
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ${
          isExpanded ? 'w-[320px] min-h-[550px]' : 'w-[240px] h-[320px]'
        }`}
      >
        {/* Tile Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-foreground">Client Background</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Document Preview or Expanded Content */}
        {!isExpanded ? (
          <div className="p-5 space-y-4 overflow-hidden">
            <div>
              <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div>
              <div className="h-2 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div>
              <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-2 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(550px-60px)]">
            {/* Risk Tolerance Section */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Risk Tolerance
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {documentation.riskTolerance}
              </p>
            </section>

            {/* Financial Objective Section */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Financial Objective
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {documentation.financialObjective}
              </p>
            </section>

            {/* Capacity for Loss Section */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Capacity for Loss
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {documentation.capacityForLoss}
              </p>
            </section>

            {/* Investment Horizon Section */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Investment Horizon
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {documentation.investmentHorizon}
              </p>
            </section>

            {/* Previous Meeting Summary */}
            {summary.length > 0 && (
              <section className="pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Previous Meeting Summary
                </h3>
                <ul className="space-y-1.5">
                  {summary.map((point) => (
                    <li key={point.id} className="flex items-start gap-2">
                      <div className="bullet-accent mt-1.5" />
                      <span className="text-sm text-foreground leading-relaxed">{point.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
