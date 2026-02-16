import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VieweoFilters {
  market: string;
  propertyType: string;
  brokerRole: string;
  entityType: string;
}

interface BootstrapStats {
  totalRecords: number;
  totalPrompts: number;
  uniqueBrokers: number;
  uniqueBrokerages: number;
  nonePrompts: number;
  blindSpotPercentage: number;
}

interface BrokerageItem {
  name: string;
  mentions: number;
  percentage: number;
}

interface BrokerItem {
  name: string;
  brokerage: string;
  mentions: number;
  markets: string[];
  assetClasses: string[];
}

interface PromptItem {
  prompt: string;
  market: string;
  propertyType: string;
  brokerRole: string;
  brokers: string[];
  brokerages: string[];
  hasEntity: boolean;
}

interface RawDataRow {
  name: string;
  brokerage: string;
  entity_type: string;
  market: string;
  property_type: string;
  broker_role: string;
  prompt: string;
}

function filterParams(filters: VieweoFilters) {
  return {
    market_filter: filters.market !== 'all' ? filters.market : null,
    property_type_filter: filters.propertyType !== 'all' ? filters.propertyType : null,
    broker_role_filter: filters.brokerRole !== 'all' ? filters.brokerRole : null,
    entity_type_filter: filters.entityType !== 'all' ? filters.entityType : null,
  };
}

export function useVieweoData(activeTab?: string) {
  const [filters, setFilters] = useState<VieweoFilters>({
    market: 'all',
    propertyType: 'all',
    brokerRole: 'all',
    entityType: 'all',
  });

  const params = filterParams(filters);

  // Tier 1: Bootstrap -- stats, filters, top brokerages (~5KB)
  const { data: bootstrap, isLoading: bootstrapLoading } = useQuery({
    queryKey: ['vieweo-bootstrap', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vieweo_bootstrap', params as any);
      if (error) throw error;
      return data as unknown as {
        stats: BootstrapStats;
        filters: {
          markets: string[];
          propertyTypes: string[];
          brokerRoles: string[];
          entityTypes: string[];
        };
        topBrokerages: BrokerageItem[];
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  // Tier 1 supplement: all brokerages (for search in brokerages tab)
  const { data: allBrokeragesData } = useQuery({
    queryKey: ['vieweo-all-brokerages', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vieweo_all_brokerages', {
        market_filter: params.market_filter,
        property_type_filter: params.property_type_filter,
        broker_role_filter: params.broker_role_filter,
      } as any);
      if (error) throw error;
      return (data as unknown as BrokerageItem[]) || [];
    },
    enabled: !!bootstrap && activeTab === 'brokerages',
    staleTime: 10 * 60 * 1000,
  });

  // Tier 2: Top brokers -- only when Brokers tab is active
  const { data: brokersData, isLoading: brokersLoading } = useQuery({
    queryKey: ['vieweo-top-brokers', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vieweo_top_brokers', params as any);
      if (error) throw error;
      return data as unknown as {
        topBrokers: BrokerItem[];
        allBrokers: BrokerItem[];
      };
    },
    enabled: !!bootstrap && activeTab === 'brokers',
    staleTime: 10 * 60 * 1000,
  });

  // Tier 2: Prompts -- only when Prompts tab is active
  const { data: promptsData, isLoading: promptsLoading } = useQuery({
    queryKey: ['vieweo-prompts', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vieweo_prompts', params as any);
      if (error) throw error;
      return (data as unknown as PromptItem[]) || [];
    },
    enabled: !!bootstrap && activeTab === 'prompts',
    staleTime: 10 * 60 * 1000,
  });

  // Tier 2: Raw data -- only when Raw Data tab is active
  const { data: rawDataResult, isLoading: rawDataLoading } = useQuery({
    queryKey: ['vieweo-raw-data', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vieweo_raw_data', params as any);
      if (error) throw error;
      return data as unknown as { rows: RawDataRow[]; totalCount: number };
    },
    enabled: !!bootstrap && activeTab === 'raw',
    staleTime: 10 * 60 * 1000,
  });

  const stats = bootstrap?.stats || {
    totalRecords: 0,
    totalPrompts: 0,
    uniqueBrokers: 0,
    uniqueBrokerages: 0,
    nonePrompts: 0,
    blindSpotPercentage: 0,
  };

  return {
    filters,
    setFilters,
    // Filter options
    markets: bootstrap?.filters.markets || [],
    propertyTypes: bootstrap?.filters.propertyTypes || [],
    brokerRoles: bootstrap?.filters.brokerRoles || [],
    entityTypes: bootstrap?.filters.entityTypes || [],
    // Stats
    stats,
    // Brokerages tab
    topBrokerages: bootstrap?.topBrokerages || [],
    allBrokerages: allBrokeragesData || bootstrap?.topBrokerages || [],
    // Brokers tab
    topBrokers: brokersData?.topBrokers || [],
    allBrokers: brokersData?.allBrokers || [],
    brokersLoading,
    // Prompts tab
    promptData: promptsData || [],
    promptsLoading,
    // Raw data tab
    rawData: rawDataResult?.rows || [],
    rawDataTotalCount: rawDataResult?.totalCount || 0,
    rawDataLoading,
    // General
    isLoading: bootstrapLoading,
    dataLoaded: !!bootstrap,
  };
}
