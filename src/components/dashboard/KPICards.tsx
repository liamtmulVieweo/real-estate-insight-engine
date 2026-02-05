import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  MessageSquare, 
  MapPin, 
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import type { DashboardSummary } from "@/types/dashboard";

interface KPICardsProps {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
}

interface KPIData {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

export function KPICards({ summary, isLoading }: KPICardsProps) {
  const kpis: KPIData[] = [
    {
      id: "mentions",
      label: "Total Mentions",
      value: summary?.total_mentions?.toLocaleString() || "0",
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: "prompts",
      label: "Unique Prompts",
      value: summary?.unique_prompts?.toLocaleString() || "0",
      subValue: "AI queries featuring you",
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      id: "markets",
      label: "Markets Present",
      value: summary?.markets_present || 0,
      icon: MapPin,
      color: "text-purple-600 bg-purple-100",
    },
    {
      id: "rank",
      label: "Market Rank",
      value: summary?.market_rank ? `#${summary.market_rank}` : "N/A",
      subValue: summary?.percentile ? `Top ${100 - summary.percentile}%` : undefined,
      icon: Award,
      color: "text-amber-600 bg-amber-100",
    },
    {
      id: "missed",
      label: "Missed Markets",
      value: summary?.missed_markets_count || 0,
      subValue: "Opportunity gaps",
      icon: AlertCircle,
      color: "text-red-600 bg-red-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="p-5 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              {kpi.trend !== undefined && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    kpi.trendDirection === "up"
                      ? "text-green-600"
                      : kpi.trendDirection === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {kpi.trendDirection === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {kpi.trendDirection === "down" && <ArrowDownRight className="h-3 w-3" />}
                  {kpi.trendDirection === "neutral" && <Minus className="h-3 w-3" />}
                  {kpi.trend}%
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {kpi.value}
              </p>
              {kpi.subValue && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {kpi.subValue}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
