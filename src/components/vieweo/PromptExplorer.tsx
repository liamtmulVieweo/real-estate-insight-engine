import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptExplorerProps {
  data: Array<{
    prompt: string;
    market: string;
    propertyType: string;
    brokerRole: string;
    brokers: string[];
    brokerages: string[];
    hasEntity: boolean;
  }>;
}

export function PromptExplorer({ data }: PromptExplorerProps) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayData = showAll ? data : data.slice(0, 10);

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        Prompt Explorer
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Click on any prompt to see which entities AI selected
      </p>

      {data.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No prompts available for selected filters</p>
      ) : (
        <div className="space-y-2">
          {displayData.map((item, index) => (
            <div
              key={item.prompt}
              className={cn(
                "border border-border rounded-lg overflow-hidden transition-all duration-200",
                expandedPrompt === item.prompt && "border-primary/50 shadow-sm"
              )}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <button
                onClick={() => setExpandedPrompt(expandedPrompt === item.prompt ? null : item.prompt)}
                className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors"
              >
                <MessageSquare className={cn(
                  "h-4 w-4 mt-0.5 flex-shrink-0",
                  item.hasEntity ? "text-primary" : "text-warning"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {item.prompt}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{item.market.split(',')[0]}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{item.propertyType}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{item.brokerRole}</Badge>
                  </div>
                </div>
                {expandedPrompt === item.prompt ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {expandedPrompt === item.prompt && (
                <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/30">
                  <div className="pt-4 space-y-3">
                    {item.brokerages.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Brokerages Named:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.brokerages.map(brokerage => (
                            <span key={brokerage} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">{brokerage}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.brokers.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Brokers Named:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.brokers.map(broker => (
                            <span key={broker} className="bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full text-xs font-medium">
                              {broker}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!item.hasEntity && (
                      <div className="bg-warning/10 rounded-lg p-3">
                        <p className="text-sm text-warning-foreground">
                          AI did not name any specific broker or brokerage for this prompt
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {showAll ? 'Show Less' : `Show All ${data.length} Prompts`}
        </button>
      )}
    </div>
  );
}
