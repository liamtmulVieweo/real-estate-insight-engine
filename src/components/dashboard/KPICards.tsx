import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  MapPin, 
  Map,
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
  submarkets?: string[];
  submarketsLoading?: boolean;
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
  hoverContent?: React.ReactNode;
}

export function KPICards({ summary, isLoading, submarkets = [], submarketsLoading }: KPICardsProps) {
  const kpis: KPIData[] = [
    {
      id: "prompts",
      label: "Unique Prompts",
      value: summary?.unique_prompts?.toLocaleString() || "0",
      subValue: "AI queries featuring you",
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      id: "primary-markets",
      label: "Markets Present",
      value: summary?.primary_markets_present || 0,
      icon: Map,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: "submarkets",
      label: "Submarkets Present",
      value: summary?.submarkets_present || 0,
      icon: MapPin,
      color: "text-purple-600 bg-purple-100",
      hoverContent: submarkets.length > 0 ? (
        <div className="space-y-1">
          <p className="font-medium text-sm mb-2">Submarkets ({submarkets.length})</p>
          <ScrollArea className="h-48">
            <ul className="space-y-1 text-sm">
              {submarkets.map((submarket) => (
                <li key={submarket} className="text-muted-foreground">
                  {submarket}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      ) : submarketsLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <p className="text-sm text-muted-foreground">No submarkets found</p>
      ),
    },
    {
      id: "rank",
      label: "Market Rank",
      value: summary?.market_rank ? `#${summary.market_rank}` : "N/A",
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

  const renderKPICard = (kpi: KPIData) => {
    const cardContent = (
      <Card className="p-5 hover:shadow-md transition-shadow cursor-default">
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
    );

    if (kpi.hoverContent) {
      return (
        <HoverCard key={kpi.id} openDelay={200}>
          <HoverCardTrigger asChild>
            {cardContent}
          </HoverCardTrigger>
          <HoverCardContent className="w-64" align="start">
            {kpi.hoverContent}
          </HoverCardContent>
        </HoverCard>
      );
    }

    return <div key={kpi.id}>{cardContent}</div>;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map(renderKPICard)}
    </div>
  );
}
