import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardSummary, MarketData, PropertyTypeBreakdown } from "@/types/dashboard";

interface CREBootstrapData {
  markets: string[];
  submarkets: string[];
  propertyTypes: string[];
  roles: string[];
  marketRankings: MarketData[];
  propertyTypeBreakdown: PropertyTypeBreakdown[];
  summary: DashboardSummary | undefined;
  primaryMarkets: string[];
}

export function useCREBootstrap(
  targetBrokerage: string,
  marketFilter?: string,
  propertyTypeFilter?: string,
  roleFilter?: string,
  stateFilter?: string,
) {
  return useQuery({
    queryKey: ["cre-bootstrap", targetBrokerage, marketFilter, propertyTypeFilter, roleFilter, stateFilter],
    queryFn: async (): Promise<CREBootstrapData> => {
      const { data, error } = await supabase.rpc("get_cre_dashboard_bootstrap", {
        target_brokerage: targetBrokerage || null,
        market_filter: marketFilter || null,
        property_type_filter: propertyTypeFilter || null,
        role_filter: roleFilter || null,
        state_filter: stateFilter || null,
      } as any);

      if (error) throw error;

      const raw = data as any;

      return {
        markets: (raw.markets || []) as string[],
        submarkets: (raw.submarkets || []) as string[],
        propertyTypes: (raw.propertyTypes || []) as string[],
        roles: (raw.roles || []) as string[],
        marketRankings: (raw.marketRankings || []).map((d: any) => ({
          market: d.market || "",
          mentions: Number(d.mentions) || 0,
          rank: Number(d.rank) || 1,
          totalBrokerages: Number(d.totalBrokerages) || 0,
          percentile: Number(d.percentile) || 0,
          marketSharePct: Number(d.marketSharePct) || 0,
        })),
        propertyTypeBreakdown: (raw.propertyTypeBreakdown || []).map((d: any) => ({
          property_type: d.property_type || "",
          mentions: Number(d.mentions) || 0,
          rank: Number(d.rank) || 1,
          total_brokerages: Number(d.total_brokerages) || 0,
        })),
        summary: raw.summary && Object.keys(raw.summary).length > 0
          ? raw.summary as DashboardSummary
          : undefined,
        primaryMarkets: (raw.primaryMarkets || []) as string[],
      };
    },
    enabled: !!targetBrokerage,
    staleTime: 10 * 60 * 1000,
  });
}
