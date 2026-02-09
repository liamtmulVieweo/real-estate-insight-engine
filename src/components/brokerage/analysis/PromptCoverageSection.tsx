import { useState } from "react";
import type { PromptCoverage } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ChevronDown } from "lucide-react";

interface PromptCoverageSectionProps {
  coverage: PromptCoverage;
}

export function PromptCoverageSection({ coverage }: PromptCoverageSectionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    {
      key: "supported",
      title: "Covered",
      description: "Prompts where your brokerage could appear",
      items: coverage.supported || [],
      icon: <CheckCircle2 className="h-4 w-4 text-status-success" />,
      countClass: "text-status-success",
    },
    {
      key: "missing",
      title: "Gaps",
      description: "Prompts with missing information",
      items: coverage.missing || [],
      icon: <AlertTriangle className="h-4 w-4 text-status-warning" />,
      countClass: "text-status-warning",
    },
    {
      key: "blocked",
      title: "Not Yet Eligible",
      description: "Content needed before AI recommends you",
      items: coverage.blocked || [],
      icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
      countClass: "text-muted-foreground",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Prompt Coverage</CardTitle>
        <Popover>
          <PopoverTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent>
            <p className="font-medium text-sm">What are intent anchors?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Intent anchors are the key phrases and context that AI assistants use to match user queries with relevant businesses. Strong anchors include property types, markets, and specific services.
            </p>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section) => (
          <Collapsible
            key={section.key}
            open={openSection === section.key}
            onOpenChange={(open) => setOpenSection(open ? section.key : null)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div className="text-left">
                    <span className="font-medium text-sm">{section.title}</span>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${section.countClass}`}>
                    {section.items.length}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 py-3">
                {section.items.length > 0 ? (
                  <div className="space-y-1">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None found</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
