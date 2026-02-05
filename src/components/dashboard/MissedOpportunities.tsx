import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GapMarket, GapDimension } from "@/types/dashboard";

interface MissedOpportunitiesProps {
  gapMarkets: GapMarket[];
  gapDimensions: GapDimension[];
  isLoadingMarkets: boolean;
  isLoadingDimensions: boolean;
}

export function MissedOpportunities({
  gapMarkets,
  gapDimensions,
  isLoadingMarkets,
  isLoadingDimensions,
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

        {/* Under-Indexed Specialties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Under-Indexed Specialties</CardTitle>
            <CardDescription>Property types and roles where you lag behind peers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDimensions ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : gapDimensions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No under-indexed specialties found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Segment</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Your Share</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Avg Share</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapDimensions.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2">
                          <div>
                            <span className="font-medium">{item.property_type}</span>
                            <Badge variant="outline" className="text-xs ml-2">
                              {item.broker_role}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right">
                          {item.target_share_pct?.toFixed(1) || 0}%
                        </td>
                        <td className="py-2 px-2 text-right">
                          {item.market_avg_share_pct?.toFixed(1) || 0}%
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className="text-destructive font-medium">
                            {item.gap_pct?.toFixed(1) || 0}%
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
