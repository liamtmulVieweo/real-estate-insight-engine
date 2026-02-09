import { useState } from "react";
import type { MarketOpportunity } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, ChevronDown } from "lucide-react";

interface MarketOpportunitySectionProps {
  opportunity: MarketOpportunity;
}

export function MarketOpportunitySection({ opportunity }: MarketOpportunitySectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <CardTitle className="text-base">Market Content Opportunity</CardTitle>
                  <p className="text-xs text-muted-foreground">{opportunity.submarket}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Suggested Page Title</p>
              <p className="text-sm font-medium">{opportunity.suggested_title}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Content Structure</p>
              <p className="text-sm">{opportunity.headings_description}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Include</p>
              <div className="space-y-1">
                {(opportunity.required_content || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-status-success">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Avoid</p>
              <div className="space-y-1">
                {(opportunity.avoid || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-status-danger">✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
