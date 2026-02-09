import { useState } from "react";
import type { IntentCoverage } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown } from "lucide-react";

interface IntentMonitoringProps {
  intents: IntentCoverage[];
}

function statusBadge(status: string) {
  switch (status) {
    case "Eligible":
      return (
        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
          <CheckCircle2 className="h-3 w-3" />
          Eligible
        </Badge>
      );
    case "Needs Work":
    case "Partially Blocked":
      return (
        <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
          <AlertTriangle className="h-3 w-3" />
          Needs Work
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <XCircle className="h-3 w-3" />
          Not Yet Eligible
        </Badge>
      );
  }
}

export function IntentMonitoring({ intents }: IntentMonitoringProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const newSet = new Set(openItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOpenItems(newSet);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Prompt Monitoring</CardTitle>
        <p className="text-sm text-muted-foreground">
          How AI assistants respond when users ask about services like yours
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {(intents || []).map((intent) => (
          <Collapsible
            key={intent.intent_name}
            open={openItems.has(intent.intent_name)}
            onOpenChange={() => toggle(intent.intent_name)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                <span className="font-medium text-sm text-left">{intent.intent_name}</span>
                <div className="flex items-center gap-2">
                  {statusBadge(intent.status)}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 py-3 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Example Prompts</p>
                  <div className="space-y-1">
                    {(intent.prompts || []).map((prompt, i) => (
                      <div key={i} className="text-sm italic text-muted-foreground">
                        <span>"</span>
                        <span>{prompt}</span>
                        <span>"</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(intent.solution_fixes || []).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">How to Fix</p>
                    <div className="space-y-1">
                      {(intent.solution_fixes || []).map((fix, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{fix.fix_name}:</span>
                          <span className="ml-1">{fix.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
