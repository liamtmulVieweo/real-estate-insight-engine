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

export function useBrokerageList() {
  return useQuery({
    queryKey: ["brokerages"],
    queryFn: async (): Promise<BrokerageMentionTotal[]> => {
      const { data, error } = await supabase
        .from("brokerage_mentions_total")
        .select("*")
        .order("total_mentions", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return (data || []).map(d => ({
        brokerage: d.brokerage || "",
        total_mentions: Number(d.total_mentions) || 0,
        unique_prompts: Number(d.unique_prompts) || 0,
        markets_present: Number(d.markets_present) || 0,
      }));
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
      return (data || []).map(d => ({
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
    queryKey: ["distinct-markets"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("lovable_prompts")
        .select("primary_market")
        .not("primary_market", "is", null);
      
      if (error) throw error;
      const markets = [...new Set((data || []).map(d => d.primary_market).filter(Boolean))];
      return markets.sort() as string[];
    },
  });
}

export function useDistinctPropertyTypes() {
  return useQuery({
    queryKey: ["distinct-property-types"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("lovable_prompts")
        .select("property_type")
        .not("property_type", "is", null);
      
      if (error) throw error;
      const types = [...new Set((data || []).map(d => d.property_type).filter(Boolean))];
      return types.sort() as string[];
    },
  });
}

export function useDistinctRoles() {
  return useQuery({
    queryKey: ["distinct-roles"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("lovable_prompts")
        .select("broker_role")
        .not("broker_role", "is", null);
      
      if (error) throw error;
      const roles = [...new Set((data || []).map(d => d.broker_role).filter(Boolean))];
      return roles.sort() as string[];
    },
  });
}
