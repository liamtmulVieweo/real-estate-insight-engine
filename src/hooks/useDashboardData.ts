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
  PropertyTypeBreakdown,
} from "@/types/dashboard";

const LONG_STALE = 30 * 60 * 1000; // 30 minutes for stable/filter data

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
    staleTime: LONG_STALE,
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

export function useCompetitiveRankings(targetBrokerage: string, marketFilter?: string, enabled = true) {
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
    enabled: !!targetBrokerage && enabled,
  });
}

export function useMissedMarketOpportunities(targetBrokerage: string, enabled = true) {
  return useQuery({
    queryKey: ["missed-opportunities", targetBrokerage],
    queryFn: async (): Promise<GapMarket[]> => {
      const { data, error } = await supabase.rpc("get_missed_market_opportunities", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage && enabled,
  });
}

export function useUnderIndexSegments(targetBrokerage: string, enabled = true) {
  return useQuery({
    queryKey: ["underindex-segments", targetBrokerage],
    queryFn: async (): Promise<GapDimension[]> => {
      const { data, error } = await supabase.rpc("get_underindex_segments", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage && enabled,
  });
}

export function usePromptIntelligence(filters: {
  brokerage?: string;
  market?: string;
  propertyType?: string;
  brokerRole?: string;
  model?: string;
  fetchAll?: boolean;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["prompt-intelligence", filters],
    queryFn: async (): Promise<PromptIntelligence[]> => {
      const pageSize = 100; // Max allowed by RPC
      const allResults: PromptIntelligence[] = [];
      let offset = 0;

      // Fetch all pages when fetchAll is true
      while (true) {
        const { data, error } = await supabase.rpc("get_prompt_intelligence", {
          brokerage_filter: filters.brokerage || null,
          market_filter: filters.market || null,
          property_type_filter: filters.propertyType || null,
          broker_role_filter: filters.brokerRole || null,
          model_filter: filters.model || null,
          page_limit: pageSize,
          page_offset: offset,
        });

        if (error) throw error;

        const batch = (data || []).map((d) => ({
          ...d,
          mentioned_entities: d.mentioned_entities as unknown as PromptIntelligence["mentioned_entities"],
        }));

        allResults.push(...batch);

        // Stop if we got fewer results than page size (last page) or not fetching all
        if (batch.length < pageSize || !filters.fetchAll) break;
        offset += pageSize;
      }

      return allResults;
    },
    enabled: filters.enabled !== false,
  });
}

export function useSourceAttribution(targetBrokerage: string, enabled = true) {
  return useQuery({
    queryKey: ["source-attribution", targetBrokerage],
    queryFn: async (): Promise<SourceAttribution[]> => {
      const { data, error } = await supabase.rpc("get_source_attribution_comparison", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBrokerage && enabled,
  });
}

export function useBrokerageMatchedDomain(targetBrokerage: string, enabled = true) {
  return useQuery({
    queryKey: ["brokerage-matched-domain", targetBrokerage],
    staleTime: LONG_STALE,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from("lovable_entities")
        .select("matched_domain")
        .or(`normalized_brokerage.eq.${targetBrokerage},brokerage.eq.${targetBrokerage}`)
        .not("matched_domain", "is", null)
        .limit(1);

      if (error) throw error;
      return data?.[0]?.matched_domain || null;
    },
    enabled: !!targetBrokerage && enabled,
  });
}

export function useMarketRankings(targetBrokerage: string) {
  return useQuery({
    queryKey: ["market-rankings", targetBrokerage],
    staleTime: LONG_STALE,
    queryFn: async (): Promise<MarketData[]> => {
      const rows = await fetchAllRows<{
        brokerage: string | null;
        market: string | null;
        mentions: number | null;
        market_rank: number | null;
        percentile: number | null;
        market_share_pct: number | null;
      }>("brokerage_market_rankings", "*");

      // Calculate total brokerages per market
      const brokeragesPerMarket: Record<string, number> = {};
      rows.forEach((row) => {
        if (row.market) {
          brokeragesPerMarket[row.market] = (brokeragesPerMarket[row.market] || 0) + 1;
        }
      });

      // Filter to target brokerage and sort by market share
      return rows
        .filter((d) => d.brokerage === targetBrokerage)
        .map((d) => ({
          market: d.market || "",
          mentions: Number(d.mentions) || 0,
          rank: Number(d.market_rank) || 1,
          totalBrokerages: brokeragesPerMarket[d.market || ""] || 0,
          // Invert percentile: rank 1 (top) = 99th percentile (better than 99%)
          percentile: (1 - (d.percentile || 0)) * 100,
          marketSharePct: d.market_share_pct || 0,
        }))
        .sort((a, b) => b.marketSharePct - a.marketSharePct);
    },
    enabled: !!targetBrokerage,
  });
}

export function useDistinctMarkets() {
  return useQuery({
    // paginated fetch avoids the 1000-row default cap
    queryKey: ["distinct-primary-markets"],
    staleTime: LONG_STALE,
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

export function useDistinctSubmarkets() {
  return useQuery({
    queryKey: ["distinct-submarkets"],
    staleTime: LONG_STALE,
    queryFn: async (): Promise<string[]> => {
      const rows = await fetchAllRows<{ submarket: string | null }>(
        "lovable_prompts",
        "submarket"
      );

      const submarkets = [...new Set(rows.map((r) => r.submarket).filter(Boolean))];
      return (submarkets as string[]).sort();
    },
  });
}

export function useDistinctPropertyTypes() {
  return useQuery({
    queryKey: ["distinct-property-types"],
    staleTime: LONG_STALE,
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
    staleTime: LONG_STALE,
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

export function useSubmarketsForBrokerage(targetBrokerage: string, enabled = true) {
  return useQuery({
    queryKey: ["submarkets-for-brokerage", targetBrokerage],
    queryFn: async (): Promise<string[]> => {
      const rows = await fetchAllRows<{
        submarket: string | null;
        brokerage: string | null;
        name: string | null;
      }>(
        "lovable_entities",
        "brokerage, name, prompt_hash"
      );

      // Get prompt hashes for this brokerage (match COALESCE logic from SQL)
      const brokeragePromptHashes = new Set(
        rows
          .filter((r) => (r.brokerage ?? r.name) === targetBrokerage)
          .map((r) => (r as any).prompt_hash)
      );

      // Now fetch submarkets for those prompts
      const promptRows = await fetchAllRows<{
        prompt_hash: string;
        submarket: string | null;
      }>("lovable_prompts", "prompt_hash, submarket");

      const submarkets = [
        ...new Set(
          promptRows
            .filter((p) => brokeragePromptHashes.has(p.prompt_hash) && p.submarket)
            .map((p) => p.submarket)
        ),
      ];

      return (submarkets as string[]).sort();
    },
    enabled: !!targetBrokerage && enabled,
  });
}

export function usePrimaryMarketsForBrokerage(targetBrokerage: string) {
  return useQuery({
    queryKey: ["primary-markets-for-brokerage", targetBrokerage],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc("get_primary_markets_for_brokerage", {
        target_brokerage: targetBrokerage,
      });

      if (error) throw error;
      return (data || []).map((d: { primary_market: string }) => d.primary_market);
    },
    enabled: !!targetBrokerage,
  });
}

export function usePropertyTypeBreakdown(targetBrokerage: string, marketFilter?: string) {
  return useQuery({
    queryKey: ["property-type-breakdown", targetBrokerage, marketFilter],
    queryFn: async (): Promise<PropertyTypeBreakdown[]> => {
      const { data, error } = await supabase.rpc("get_property_type_breakdown", {
        target_brokerage: targetBrokerage,
        market_filter: marketFilter || null,
      });

      if (error) throw error;
      return (data || []).map((d: { property_type: string; mentions: number; rank: number; total_brokerages: number }) => ({
        property_type: d.property_type,
        mentions: Number(d.mentions),
        rank: Number(d.rank),
        total_brokerages: Number(d.total_brokerages),
      }));
    },
    enabled: !!targetBrokerage,
  });
}

export interface BrokerTeamData {
  broker_name: string;
  property_types: string[];
  mentions: number;
  global_rank: number;
  total_brokers: number;
}

export function useBrokerTeamBreakdown(targetBrokerage: string, marketFilter?: string, propertyTypeFilter?: string, enabled = true) {
  return useQuery({
    queryKey: ["broker-team-breakdown", targetBrokerage, marketFilter, propertyTypeFilter],
    queryFn: async (): Promise<BrokerTeamData[]> => {
      const { data, error } = await supabase.rpc("get_broker_team_breakdown", {
        target_brokerage: targetBrokerage,
        market_filter: marketFilter || null,
        property_type_filter: propertyTypeFilter || null,
      });

      if (error) throw error;
      return (data || []).map((d: { broker_name: string; property_types: string[]; mentions: number; global_rank: number; total_brokers: number }) => ({
        broker_name: d.broker_name,
        property_types: d.property_types || [],
        mentions: Number(d.mentions),
        global_rank: Number(d.global_rank),
        total_brokers: Number(d.total_brokers),
      }));
    },
    enabled: !!targetBrokerage && enabled,
  });
}

export function useOriginalBrokerageNames(normalizedBrokerage: string, enabled = true) {
  return useQuery({
    queryKey: ["original-brokerage-names", normalizedBrokerage],
    staleTime: LONG_STALE,
    queryFn: async (): Promise<string[]> => {
      // Fetch entities where normalized_brokerage matches, and collect distinct original brokerage/name values
      const rows = await fetchAllRows<{
        brokerage: string | null;
        name: string | null;
        normalized_brokerage: string | null;
      }>("lovable_entities", "brokerage, name, normalized_brokerage");

      const originals = new Set<string>();
      rows.forEach((r) => {
        const resolved = r.brokerage ?? r.name ?? "";
        const normalized = r.normalized_brokerage;
        // If this entity has a normalized name matching our target, and the original differs
        if (normalized === normalizedBrokerage && resolved && resolved !== normalizedBrokerage) {
          originals.add(resolved);
        }
      });

      return [...originals].sort();
    },
    enabled: !!normalizedBrokerage && enabled,
  });
}

