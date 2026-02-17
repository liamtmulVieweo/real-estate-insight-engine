import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GapMarket, SourceAttribution } from "@/types/dashboard";
import { useMemo } from "react";

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
}

function SourceTable({ items }: { items: SourceAttribution[] }) {
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
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Your %</th>
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Peer Avg</th>
            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Diff</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.domain} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-2 px-2 font-medium truncate max-w-[150px]" title={item.domain}>
                {item.domain}
              </td>
              <td className="py-2 px-2 text-right">{item.target_pct?.toFixed(1)}%</td>
              <td className="py-2 px-2 text-right">{item.peer_avg_pct?.toFixed(1)}%</td>
              <td className="py-2 px-2 text-right">
                <span
                  className={
                    item.diff_pct > 0
                      ? "text-green-600 font-medium"
                      : item.diff_pct < 0
                      ? "text-red-600 font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {item.diff_pct > 0 ? "+" : ""}
                  {item.diff_pct?.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
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
}: MissedOpportunitiesProps) {
  // Group source data by category, filtering brokerage categories
  const { ownDomain, groupedCategories } = useMemo(() => {
    // Use matched_domain from DB instead of fuzzy matching
    let ownDomain: SourceAttribution | null = null;
    const filtered: SourceAttribution[] = [];

    for (const item of sourceData) {
      const cat = item.category || "Other";
      const isBrokerageCat = BROKERAGE_CATEGORIES.includes(cat);

      if (isBrokerageCat) {
        // Only match if we have an exact matched_domain from the DB
        if (brokerageMatchedDomain && item.domain.toLowerCase() === brokerageMatchedDomain.toLowerCase()) {
          ownDomain = item;
        }
        // Skip all brokerage category domains from regular display
        continue;
      }

      filtered.push(item);
    }

    // Group by category
    const groups: Record<string, SourceAttribution[]> = {};
    for (const item of filtered) {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }

    // Sort categories by defined order
    const sortedCategories = Object.entries(groups).sort(([a], [b]) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    return { ownDomain, groupedCategories: sortedCategories };
  }, [sourceData, brokerageMatchedDomain]);

  // Default to first available category
  const defaultTab = groupedCategories.length > 0 ? groupedCategories[0][0] : "Other";

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

        {/* Source Attribution - grouped by category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source Attribution</CardTitle>
            <CardDescription>Domains driving your visibility vs. peers, by category</CardDescription>
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
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold">{ownDomain.domain}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{ownDomain.category}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span>You: <strong>{ownDomain.target_pct?.toFixed(1)}%</strong></span>
                        <span>Peers: {ownDomain.peer_avg_pct?.toFixed(1)}%</span>
                        <span className={ownDomain.diff_pct >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {ownDomain.diff_pct > 0 ? "+" : ""}{ownDomain.diff_pct?.toFixed(1)}%
                        </span>
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

                {/* Category tabs */}
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="w-full flex-wrap h-auto gap-1">
                    {groupedCategories.map(([cat, items]) => (
                      <TabsTrigger key={cat} value={cat} className="text-xs">
                        {cat} ({items.length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {groupedCategories.map(([cat, items]) => (
                    <TabsContent key={cat} value={cat}>
                      <div className="max-h-[220px] overflow-y-auto">
                        <SourceTable items={items} />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
