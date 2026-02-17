import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCoMentionDetails } from "@/hooks/useDashboardData";

export interface CoMentionedBrokerage {
  brokerage: string;
  co_mentions: number;
}

interface CompetitorsListProps {
  data: CoMentionedBrokerage[];
  isLoading: boolean;
  selectedBrokerage?: string;
}

function PeerRow({ item, idx, selectedBrokerage }: { item: CoMentionedBrokerage; idx: number; selectedBrokerage: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: details, isLoading } = useCoMentionDetails(
    selectedBrokerage,
    item.brokerage,
    isOpen
  );

  const markets = details
    ? [...new Set(details.map((d) => d.market).filter(Boolean))]
    : [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <tr className="border-b border-border/50 hover:bg-muted/30 cursor-pointer">
          <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
          <td className="py-2 px-2 font-medium">{item.brokerage}</td>
          <td className="py-2 px-2 text-right">
            <div className="flex items-center justify-end gap-1">
              <Badge variant="secondary" className="text-xs">
                {item.co_mentions.toLocaleString()}
              </Badge>
              {isOpen ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </td>
        </tr>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <tr>
          <td colSpan={3} className="p-0">
            <div className="px-4 py-3 bg-muted/20 border-b border-border/50">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading details...
                </div>
              ) : (
                <>
                  {markets.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground font-medium">Markets</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {markets.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {details && details.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Shared Prompts</span>
                      <div className="mt-1 space-y-1 max-h-[150px] overflow-y-auto">
                        {details.map((d) => (
                          <p key={d.prompt_hash} className="text-xs text-foreground/80 line-clamp-1">
                            "{d.prompt}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!details || details.length === 0) && (
                    <p className="text-xs text-muted-foreground">No shared prompt details found</p>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CompetitorsList({ data, isLoading, selectedBrokerage }: CompetitorsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Prompt Peers</CardTitle>
            <CardDescription>
              Brokerages co-mentioned in the same prompts as {selectedBrokerage || "you"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No co-mentioned brokerages found
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground w-10">#</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Brokerage</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Shared Prompts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <PeerRow
                    key={item.brokerage}
                    item={item}
                    idx={idx}
                    selectedBrokerage={selectedBrokerage || ""}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
