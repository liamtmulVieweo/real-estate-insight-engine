import { useState } from "react";
import type { AnalysisSummary } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertCircle, Unlock } from "lucide-react";

interface SummarySectionProps {
  summary: {
    blocking_issues: string[];
    key_unlocks: string[];
  };
  analysisSummary: AnalysisSummary;
}

export function SummarySection({ summary, analysisSummary }: SummarySectionProps) {
  const [issuesOpen, setIssuesOpen] = useState(false);
  const [unlocksOpen, setUnlocksOpen] = useState(false);
  const [conclusionOpen, setConclusionOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <Collapsible open={issuesOpen} onOpenChange={setIssuesOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm">Key Issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{summary.blocking_issues.length}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2">
                  {(summary.blocking_issues || []).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card>
          <Collapsible open={unlocksOpen} onOpenChange={setUnlocksOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">Key Wins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{summary.key_unlocks.length}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2">
                  {(summary.key_unlocks || []).map((unlock, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span>{unlock}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      <Collapsible open={conclusionOpen} onOpenChange={setConclusionOpen}>
        <CollapsibleTrigger className="w-full">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Analysis Conclusion</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-1">
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Current Visibility</p>
                <div className="space-y-1">
                  {(analysisSummary.visibility_snapshot || []).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Focus Areas</p>
                <div className="space-y-1">
                  {(analysisSummary.fix_categories || []).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Bottom Line</p>
                <p className="text-sm">{analysisSummary.conclusion}</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
