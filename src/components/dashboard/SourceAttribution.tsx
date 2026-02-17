import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SourceAttribution as SourceData } from "@/types/dashboard";

interface SourceAttributionProps {
  data: SourceData[];
  isLoading: boolean;
}

export function SourceAttribution({ data, isLoading }: SourceAttributionProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Source Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 8).map((item) => ({
    name: item.domain.length > 20 ? item.domain.slice(0, 20) + "..." : item.domain,
    fullName: item.domain,
    you: item.target_pct || 0,
    peers: item.competitor_pct || 0,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Source Attribution</CardTitle>
        <CardDescription>Compare where AI models find your data vs. peers</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No source attribution data available
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, "auto"]}
                />
                <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name === "you" ? "You" : "Peer Avg",
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName || ""
                  }
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Legend
                  formatter={(value) => (value === "you" ? "You" : "Peer Avg")}
                />
                <Bar dataKey="you" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="peers" fill="#94A3B8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
