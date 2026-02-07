import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MarketData } from "@/types/dashboard";

interface MarketVisibilityProps {
  data: MarketData[];
  isLoading: boolean;
}

const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

export function MarketVisibility({ data, isLoading }: MarketVisibilityProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Market Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const topMarkets = data.slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Market Visibility</CardTitle>
          <CardDescription>Where your brokerage appears most frequently</CardDescription>
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("table")}
            className={`p-1.5 h-8 w-8 ${
              viewMode === "table" ? "bg-background shadow-sm" : ""
            }`}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("chart")}
            className={`p-1.5 h-8 w-8 ${
              viewMode === "chart" ? "bg-background shadow-sm" : ""
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Market</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Mentions</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Share</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Rank</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Percentile</th>
                </tr>
              </thead>
              <tbody>
                {topMarkets.map((item) => (
                  <tr key={item.market} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{item.market}</td>
                    <td className="py-3 px-2 text-right">{item.mentions.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">{item.marketSharePct.toFixed(1)}%</td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-semibold">#{item.rank}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        of {item.totalBrokerages}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.percentile > 90
                                ? "bg-green-500"
                                : item.percentile > 70
                                ? "bg-blue-500"
                                : item.percentile > 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${item.percentile}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right">
                          {item.percentile >= 99 ? "99th" : `${Math.round(item.percentile)}th`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMarkets} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="market" width={75} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Market Share"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="marketSharePct" radius={[0, 4, 4, 0]}>
                  {topMarkets.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
