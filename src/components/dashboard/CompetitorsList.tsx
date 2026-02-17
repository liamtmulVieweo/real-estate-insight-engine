import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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
    <>
      <tr
        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="py-2.5 px-3 text-muted-foreground text-xs">{idx + 1}</td>
        <td className="py-2.5 px-3 font-medium text-sm">{item.brokerage}</td>
        <td className="py-2.5 px-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">{item.co_mentions.toLocaleString()}</span>
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={3} className="p-0">
            <div className="px-4 py-3 bg-muted/10 border-b border-border/50">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading details...
                </div>
              ) : (
                <div className="space-y-3">
                  {markets.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Markets</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {markets.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs font-normal">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {details && details.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Shared Prompts ({details.length})
                      </span>
                      <div className="mt-1.5 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {details.map((d) => (
                          <div key={d.prompt_hash} className="text-xs text-foreground/80 bg-background/50 rounded px-2.5 py-1.5 border border-border/30">
                            <p className="line-clamp-2">"{d.prompt}"</p>
                            {(d.property_type || d.broker_role) && (
                              <div className="flex gap-2 mt-1 text-muted-foreground">
                                {d.property_type && <span>{d.property_type}</span>}
                                {d.property_type && d.broker_role && <span>·</span>}
                                {d.broker_role && <span>{d.broker_role}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!details || details.length === 0) && (
                    <p className="text-xs text-muted-foreground">No shared prompt details found</p>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground w-10">#</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Brokerage</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Shared Prompts</th>
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
