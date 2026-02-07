import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Competitor } from "@/types/dashboard";

interface CompetitiveRankingsProps {
  competitors: Competitor[];
  isLoading: boolean;
}

export function CompetitiveRankings({ competitors, isLoading }: CompetitiveRankingsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompetitors = competitors.filter((c) =>
    c.brokerage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the target brokerage and determine display logic
  const displayData = useMemo(() => {
    if (searchTerm) {
      // When searching, show filtered results
      return { competitors: filteredCompetitors.slice(0, 20), showContextWindow: false };
    }

    const targetIndex = competitors.findIndex((c) => c.is_target);
    const targetRank = targetIndex !== -1 ? competitors[targetIndex].rank : null;

    // If target is in top 20, show top 20
    if (targetRank === null || targetRank <= 20) {
      return { competitors: competitors.slice(0, 20), showContextWindow: false };
    }

    // Target is outside top 20 - show top 10 + context window around target
    const top10 = competitors.slice(0, 10);
    
    // Get 5 above and 5 below target (including target)
    const windowStart = Math.max(0, targetIndex - 5);
    const windowEnd = Math.min(competitors.length, targetIndex + 6);
    const contextWindow = competitors.slice(windowStart, windowEnd);

    // Check if there's a gap between top 10 and context window
    const hasGap = windowStart > 10;

    return {
      competitors: top10,
      contextWindow,
      showContextWindow: true,
      hasGap,
      targetRank,
    };
  }, [competitors, filteredCompetitors, searchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brokerage Competitive Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const renderRow = (competitor: Competitor) => (
    <tr
      key={competitor.brokerage}
      className={`border-b border-border/50 hover:bg-muted/30 ${
        competitor.is_target ? "bg-primary/5" : ""
      }`}
    >
      <td className="py-3 px-3">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
            competitor.rank <= 3
              ? "bg-amber-100 text-amber-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {competitor.rank}
        </span>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{competitor.brokerage}</span>
          {competitor.is_target && (
            <Badge variant="default" className="text-xs">
              You
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3 px-3 text-right font-medium">
        {competitor.mentions.toLocaleString()}
      </td>
      <td className="py-3 px-3 text-right">
        <span
          className={`font-medium ${
            competitor.vs_target_diff > 0
              ? "text-green-600"
              : competitor.vs_target_diff < 0
              ? "text-red-600"
              : "text-muted-foreground"
          }`}
        >
          {competitor.vs_target_diff > 0 ? "+" : ""}
          {competitor.vs_target_diff.toLocaleString()}
        </span>
      </td>
    </tr>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Brokerage Competitive Rankings</CardTitle>
          <CardDescription>Compare your visibility against direct competitors</CardDescription>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brokerages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium text-muted-foreground w-16">Rank</th>
                <th className="text-left py-3 px-3 font-medium text-muted-foreground">Brokerage</th>
                <th className="text-right py-3 px-3 font-medium text-muted-foreground">Mentions</th>
                <th className="text-right py-3 px-3 font-medium text-muted-foreground">vs Target</th>
              </tr>
            </thead>
            <tbody>
              {displayData.competitors.map(renderRow)}
              
              {displayData.showContextWindow && displayData.hasGap && (
                <tr className="border-b border-border/50">
                  <td colSpan={4} className="py-3 px-3 text-center">
                    <span className="text-muted-foreground text-sm">
                      ••• {displayData.contextWindow?.[0]?.rank - 11} brokerages •••
                    </span>
                  </td>
                </tr>
              )}
              
              {displayData.showContextWindow && displayData.contextWindow?.map(renderRow)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
