import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import type { GapMarket, SourceAttribution, BrokerageMentionTotal } from "@/types/dashboard";
import { useMemo, useState } from "react";

const BROKERAGE_CATEGORIES = ["Residential Brokerage", "CRE Brokerage"];

const CATEGORY_ORDER = [
  "CRE Brokerage",
  "Residential Brokerage",
  "Listing Platform/Marketplace",
  "Media/News",
  "Tourism/Attractions",
  "Owner/Developer/Investor",
  "Service Provider",
  "Other",
];

interface MissedOpportunitiesProps {
  gapMarkets: GapMarket[];
  sourceData: SourceAttribution[];
  isLoadingMarkets: boolean;
  isLoadingSource: boolean;
  selectedBrokerage?: string;
  brokerageMatchedDomain?: string;
  brokerages?: BrokerageMentionTotal[];
  competitorBrokerage: string;
  onCompetitorChange: (value: string) => void;
}

function SourceTable({ items, showCompetitor, competitorName }: { items: SourceAttribution[]; showCompetitor: boolean; competitorName?: string }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4 text-sm">
        No domains in this category
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Domain</th>
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">You %</th>
            {showCompetitor && (
              <>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">{competitorName || "Competitor"} %</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Diff</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const diff = showCompetitor ? (item.target_pct ?? 0) - (item.competitor_pct ?? 0) : 0;
            return (
              <tr key={item.domain} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-2 font-medium truncate max-w-[150px]" title={item.domain}>
                  {item.domain}
                </td>
                <td className="py-2 px-2 text-right">{item.target_pct?.toFixed(1)}%</td>
                {showCompetitor && (
                  <>
                    <td className="py-2 px-2 text-right">{(item.competitor_pct ?? 0).toFixed(1)}%</td>
                    <td className="py-2 px-2 text-right">
                      <span
                        className={
                          diff > 0
                            ? "text-green-600 font-medium"
                            : diff < 0
                            ? "text-red-600 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                      </span>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MissedOpportunities({
  gapMarkets,
  sourceData,
  isLoadingMarkets,
  isLoadingSource,
  selectedBrokerage,
  brokerageMatchedDomain,
  brokerages = [],
  competitorBrokerage,
  onCompetitorChange,
}: MissedOpportunitiesProps) {
  const [competitorOpen, setCompetitorOpen] = useState(false);
  
  const showCompetitor = !!competitorBrokerage;

  // Group source data by category, filtering brokerage categories
  const { ownDomain, groupedCategories } = useMemo(() => {
    let ownDomain: SourceAttribution | null = null;
    const filtered: SourceAttribution[] = [];

    for (const item of sourceData) {
      const cat = item.category || "Other";
      const isBrokerageCat = BROKERAGE_CATEGORIES.includes(cat);

      if (isBrokerageCat) {
        if (brokerageMatchedDomain && item.domain.toLowerCase() === brokerageMatchedDomain.toLowerCase()) {
          ownDomain = item;
        }
        continue;
      }

      filtered.push(item);
    }

    const groups: Record<string, SourceAttribution[]> = {};
    for (const item of filtered) {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }

    const sortedCategories = Object.entries(groups).sort(([a], [b]) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    return { ownDomain, groupedCategories: sortedCategories };
  }, [sourceData, brokerageMatchedDomain]);


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-semibold">Missed Opportunities Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missed Markets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missed Markets</CardTitle>
            <CardDescription>Markets where competitors appear but you don't</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMarkets ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : gapMarkets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No missed market opportunities found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Market</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Peer Mentions</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Top Peers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapMarkets.slice(0, 10).map((item) => (
                      <tr key={item.market} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium">{item.market}</td>
                        <td className="py-2 px-2 text-right">
                          {item.total_peer_mentions.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            {item.top_peers?.slice(0, 2).map((peer) => (
                              <Badge key={peer} variant="secondary" className="text-xs">
                                {peer}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Attribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle className="text-base">Source Attribution</CardTitle>
                <CardDescription>
                  Domains driving your visibility{showCompetitor ? ` vs. ${competitorBrokerage}` : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Popover open={competitorOpen} onOpenChange={setCompetitorOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <Search className="h-3.5 w-3.5" />
                      {competitorBrokerage || "Compare with..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0 z-50 bg-popover border border-border shadow-md" align="end">
                    <Command>
                      <CommandInput placeholder="Search competitor..." />
                      <CommandList>
                        <CommandEmpty>No brokerage found.</CommandEmpty>
                        <CommandGroup>
                          {brokerages
                            .filter((b) => b.brokerage !== selectedBrokerage)
                            .map((b) => (
                              <CommandItem
                                key={b.brokerage}
                                value={b.brokerage}
                                onSelect={(val) => {
                                  onCompetitorChange(val);
                                  setCompetitorOpen(false);
                                }}
                              >
                                {b.brokerage}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {showCompetitor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onCompetitorChange("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSource ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : sourceData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No source attribution data found
              </p>
            ) : (
              <div className="space-y-3">
                {/* Own domain pinned at top */}
                {ownDomain ? (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                      <div>
                        <span className="font-semibold">{ownDomain.domain}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{ownDomain.category}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span>You: <strong>{ownDomain.target_pct?.toFixed(1)}%</strong></span>
                        {showCompetitor && (
                          <>
                            <span>{competitorBrokerage}: {(ownDomain.competitor_pct ?? 0).toFixed(1)}%</span>
                            <span className={((ownDomain.target_pct ?? 0) - (ownDomain.competitor_pct ?? 0)) >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {((ownDomain.target_pct ?? 0) - (ownDomain.competitor_pct ?? 0)) > 0 ? "+" : ""}
                              {((ownDomain.target_pct ?? 0) - (ownDomain.competitor_pct ?? 0)).toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-muted bg-muted/30 p-3">
                    <p className="text-sm text-muted-foreground">
                      No brokerage website found in the sources
                    </p>
                  </div>
                )}

                {/* Collapsible category sections */}
                <div className="max-h-[220px] overflow-y-auto space-y-1">
                  {groupedCategories.map(([cat, items]) => (
                    <Collapsible key={cat}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                        <span>{cat} ({items.length})</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SourceTable items={items} showCompetitor={showCompetitor} competitorName={competitorBrokerage} />
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
