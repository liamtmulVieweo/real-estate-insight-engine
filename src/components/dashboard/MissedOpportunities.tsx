import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GapMarket, SourceAttribution } from "@/types/dashboard";

interface MissedOpportunitiesProps {
  gapMarkets: GapMarket[];
  sourceData: SourceAttribution[];
  isLoadingMarkets: boolean;
  isLoadingSource: boolean;
}

export function MissedOpportunities({
  gapMarkets,
  sourceData,
  isLoadingMarkets,
  isLoadingSource,
}: MissedOpportunitiesProps) {
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
            <CardTitle className="text-base">Source Attribution</CardTitle>
            <CardDescription>Domains driving your visibility vs. peers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSource ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : sourceData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No source attribution data found
              </p>
            ) : (
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
                    {sourceData.slice(0, 10).map((item) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
