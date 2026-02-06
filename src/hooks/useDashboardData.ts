import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  DashboardSummary,
  Competitor,
  GapMarket,
  GapDimension,
  PromptIntelligence,
  SourceAttribution,
  BrokerageMentionTotal,
  MarketData,
} from "@/types/dashboard";

async function fetchAllRows<T>(
  table: string,
  select: string,
  batchSize = 1000
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await (supabase as any)
      .from(table)
      .select(select)
      .range(from, to);

    if (error) throw error;

    const batch = (data || []) as T[];
    all.push(...batch);

    if (batch.length < batchSize) break;
    from += batchSize;
  }

  return all;
}

export function useBrokerageList() {
  return useQuery({
    queryKey: ["brokerages"],
    queryFn: async (): Promise<BrokerageMentionTotal[]> => {
      const rows = await fetchAllRows<{
        brokerage: string | null;
        total_mentions: number | null;
        unique_prompts: number | null;
        markets_present: number | null;
      }>("brokerage_mentions_total", "*");

      return rows
        .map((d) => ({
          brokerage: d.brokerage || "",
          total_mentions: Number(d.total_mentions) || 0,
          unique_prompts: Number(d.unique_prompts) || 0,
          markets_present: Number(d.markets_present) || 0,
        }))
        .sort((a, b) => b.total_mentions - a.total_mentions);
    },
  });
}

export function useDashboardSummary(targetBrokerage: string, targetMarket?: string) {
  return useQuery({
    queryKey: ["dashboard-summary", targetBrokerage, targetMarket],
    queryFn: async (): Promise<DashboardSummary> => {
      const { data, error } = await supabase.rpc("get_dashboard_summary", {
        target_brokerage: targetBrokerage,
        target_market: targetMarket || null,
      });

      if (error) throw error;
      return data as unknown as DashboardSummary;
    },
    enabled: !!targetBrokerage,
  });
}

export function useCompetitiveRankings(targetBrokerage: string, marketFilter?: string) {
  return useQuery({
    queryKey: ["competitive-rankings", targetBrokerage, marketFilter],
    queryFn: async (): Promise<Competitor[]> => {
      const { data, error } = await supabase.rpc("get_competitive_rankings", {
        target_brokerage: targetBrokerage,
        market_filter: marketFilter || null,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage,
  });
}

export function useMissedMarketOpportunities(targetBrokerage: string) {
  return useQuery({
    queryKey: ["missed-opportunities", targetBrokerage],
    queryFn: async (): Promise<GapMarket[]> => {
      const { data, error } = await supabase.rpc("get_missed_market_opportunities", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage,
  });
}

export function useUnderIndexSegments(targetBrokerage: string) {
  return useQuery({
    queryKey: ["underindex-segments", targetBrokerage],
    queryFn: async (): Promise<GapDimension[]> => {
      const { data, error } = await supabase.rpc("get_underindex_segments", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage,
  });
}

export function usePromptIntelligence(filters: {
  brokerage?: string;
  market?: string;
  propertyType?: string;
  brokerRole?: string;
  model?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["prompt-intelligence", filters],
    queryFn: async (): Promise<PromptIntelligence[]> => {
      const { data, error } = await supabase.rpc("get_prompt_intelligence", {
        brokerage_filter: filters.brokerage || null,
        market_filter: filters.market || null,
        property_type_filter: filters.propertyType || null,
        broker_role_filter: filters.brokerRole || null,
        model_filter: filters.model || null,
        page_limit: filters.limit || 20,
        page_offset: 0,
      });

      if (error) throw error;
      return (data || []).map((d) => ({
        ...d,
        mentioned_entities: d.mentioned_entities as unknown as PromptIntelligence["mentioned_entities"],
      }));
    },
  });
}

export function useSourceAttribution(targetBrokerage: string) {
  return useQuery({
    queryKey: ["source-attribution", targetBrokerage],
    queryFn: async (): Promise<SourceAttribution[]> => {
      const { data, error } = await supabase.rpc("get_source_attribution_comparison", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage,
  });
}

export function useMarketRankings(targetBrokerage: string) {
  return useQuery({
    queryKey: ["market-rankings", targetBrokerage],
    queryFn: async (): Promise<MarketData[]> => {
      const { data, error } = await supabase
        .from("brokerage_market_rankings")
        .select("*")
        .eq("brokerage", targetBrokerage)
        .order("mentions", { ascending: false });

      if (error) throw error;
      return (data || []).map((d, idx) => ({
        market: d.market || "",
        mentions: Number(d.mentions) || 0,
        rank: Number(d.market_rank) || idx + 1,
        totalBrokerages: 100, // Approximation
        percentile: (d.percentile || 0) * 100,
        marketSharePct: d.market_share_pct || 0,
      }));
    },
    enabled: !!targetBrokerage,
  });
}

export function useDistinctMarkets() {
  return useQuery({
    // paginated fetch avoids the 1000-row default cap
    queryKey: ["distinct-primary-markets"],
    queryFn: async (): Promise<string[]> => {
      const rows = await fetchAllRows<{ primary_market: string | null }>(
        "lovable_prompts",
        "primary_market"
      );

      const markets = [...new Set(rows.map((r) => r.primary_market).filter(Boolean))];
      return (markets as string[]).sort();
    },
  });
}

export function useDistinctPropertyTypes() {
  return useQuery({
    queryKey: ["distinct-property-types"],
    queryFn: async (): Promise<string[]> => {
      const rows = await fetchAllRows<{ property_type: string | null }>(
        "lovable_prompts",
        "property_type"
      );

      const types = [...new Set(rows.map((r) => r.property_type).filter(Boolean))];
      return (types as string[]).sort();
    },
  });
}

export function useDistinctRoles() {
  return useQuery({
    queryKey: ["distinct-roles"],
    queryFn: async (): Promise<string[]> => {
      const rows = await fetchAllRows<{ broker_role: string | null }>(
        "lovable_prompts",
        "broker_role"
      );

      const roles = [...new Set(rows.map((r) => r.broker_role).filter(Boolean))];
      return (roles as string[]).sort();
    },
  });
}

