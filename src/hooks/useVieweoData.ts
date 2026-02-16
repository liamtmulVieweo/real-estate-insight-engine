import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VieweoRecord {
  entity_key: string;
  entity_type: 'broker' | 'brokerage' | 'NONE';
  name: string;
  brokerage: string;
  entity_display: string;
  market: string;
  property_type: string;
  broker_role: string;
  market_asset: string;
  market_role: string;
  prompt: string;
  evidence: string;
}

export interface VieweoFilters {
  market: string;
  propertyType: string;
  brokerRole: string;
  entityType: string;
}

async function fetchAllVisibilityRecords(): Promise<VieweoRecord[]> {
  const allRecords: VieweoRecord[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('visibility_records')
      .select('*')
      .range(offset, offset + batchSize - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      const mappedRecords = data.map(record => ({
        entity_key: record.entity_key,
        entity_type: (record.entity_type || 'NONE') as 'broker' | 'brokerage' | 'NONE',
        name: record.name,
        brokerage: record.brokerage || '',
        entity_display: record.entity_display || '',
        market: record.market,
        property_type: record.property_type || '',
        broker_role: record.broker_role || '',
        market_asset: record.market_asset || '',
        market_role: record.market_role || '',
        prompt: record.prompt,
        evidence: record.evidence || '',
      }));
      allRecords.push(...mappedRecords);
      offset += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  console.log('Loaded records from database:', allRecords.length);
  return allRecords;
}

export function useVieweoData() {
  const [filters, setFilters] = useState<VieweoFilters>({
    market: 'all',
    propertyType: 'all',
    brokerRole: 'all',
    entityType: 'all',
  });

  const { data: rawData = [], isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['vieweo-visibility-records'],
    queryFn: fetchAllVisibilityRecords,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? String(queryError) : null;
  const dataLoaded = rawData.length > 0;

  const filteredData = useMemo(() => {
    return rawData.filter(record => {
      if (filters.market !== 'all' && record.market !== filters.market) return false;
      if (filters.propertyType !== 'all' && record.property_type !== filters.propertyType) return false;
      if (filters.brokerRole !== 'all' && record.broker_role !== filters.brokerRole) return false;
      if (filters.entityType !== 'all' && record.entity_type !== filters.entityType) return false;
      return true;
    });
  }, [rawData, filters]);

  const markets = useMemo(() => [...new Set(rawData.map(d => d.market))].filter(Boolean).sort(), [rawData]);
  const propertyTypes = useMemo(() => [...new Set(rawData.map(d => d.property_type))].filter(Boolean).sort(), [rawData]);
  const brokerRoles = useMemo(() => [...new Set(rawData.map(d => d.broker_role))].filter(Boolean).sort(), [rawData]);
  const entityTypes = useMemo(() => [...new Set(rawData.map(d => d.entity_type))].filter(Boolean).sort(), [rawData]);

  // Statistics
  const stats = useMemo(() => {
    const uniquePrompts = new Set(filteredData.map(d => d.prompt));
    const brokerRecords = filteredData.filter(d => d.entity_type === 'broker');
    const brokerageRecords = filteredData.filter(d => d.entity_type === 'brokerage');
    const noneRecords = filteredData.filter(d => d.entity_type === 'NONE');

    const uniqueBrokers = new Set(brokerRecords.map(d => d.name));
    const uniqueBrokerages = new Set(brokerageRecords.map(d => d.name));

    const totalPrompts = uniquePrompts.size;
    const nonePrompts = new Set(noneRecords.map(d => d.prompt)).size;
    const blindSpotPercentage = totalPrompts > 0 ? (nonePrompts / totalPrompts) * 100 : 0;

    return {
      totalPrompts,
      uniqueBrokers: uniqueBrokers.size,
      uniqueBrokerages: uniqueBrokerages.size,
      blindSpotPercentage,
      nonePrompts,
      totalRecords: rawData.length,
    };
  }, [filteredData, rawData.length]);

  // All brokerages (for search) - no slice limit
  const allBrokerages = useMemo(() => {
    const brokerageRecords = filteredData.filter(d => d.entity_type === 'brokerage');
    const counts: Record<string, number> = {};

    brokerageRecords.forEach(record => {
      counts[record.name] = (counts[record.name] || 0) + 1;
    });

    const total = brokerageRecords.length;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        mentions: count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.mentions - a.mentions);
  }, [filteredData]);

  // Top 15 brokerages for default display
  const topBrokerages = useMemo(() => {
    return allBrokerages.slice(0, 15);
  }, [allBrokerages]);

  // All brokers (for search) - no slice limit
  const allBrokers = useMemo(() => {
    const brokerRecords = filteredData.filter(d =>
      d.entity_type === 'broker' && d.name !== d.brokerage
    );
    const brokerData: Record<string, {
      brokerage: string;
      mentions: number;
      markets: Set<string>;
      assetClasses: Set<string>;
    }> = {};

    brokerRecords.forEach(record => {
      if (!brokerData[record.name]) {
        brokerData[record.name] = {
          brokerage: record.brokerage,
          mentions: 0,
          markets: new Set(),
          assetClasses: new Set(),
        };
      }
      brokerData[record.name].mentions++;
      brokerData[record.name].markets.add(record.market);
      brokerData[record.name].assetClasses.add(record.property_type);
    });

    return Object.entries(brokerData)
      .map(([name, data]) => ({
        name,
        brokerage: data.brokerage,
        mentions: data.mentions,
        markets: [...data.markets],
        assetClasses: [...data.assetClasses],
      }))
      .sort((a, b) => b.mentions - a.mentions);
  }, [filteredData]);

  // Top 20 brokers for default display
  const topBrokers = useMemo(() => {
    return allBrokers.slice(0, 20);
  }, [allBrokers]);

  // Prompt data for explorer
  const promptData = useMemo(() => {
    const promptMap: Record<string, {
      prompt: string;
      market: string;
      propertyType: string;
      brokerRole: string;
      brokers: string[];
      brokerages: string[];
      hasEntity: boolean;
    }> = {};

    filteredData.forEach(record => {
      if (!promptMap[record.prompt]) {
        promptMap[record.prompt] = {
          prompt: record.prompt,
          market: record.market,
          propertyType: record.property_type,
          brokerRole: record.broker_role,
          brokers: [],
          brokerages: [],
          hasEntity: false,
        };
      }

      if (record.entity_type === 'broker') {
        promptMap[record.prompt].brokers.push(record.entity_display);
        promptMap[record.prompt].hasEntity = true;
      } else if (record.entity_type === 'brokerage') {
        promptMap[record.prompt].brokerages.push(record.name);
        promptMap[record.prompt].hasEntity = true;
      }
    });

    return Object.values(promptMap);
  }, [filteredData]);

  // Blind spots
  const blindSpots = useMemo(() => {
    const seen = new Set<string>();
    return filteredData
      .filter(d => d.entity_type === 'NONE')
      .filter(d => {
        if (seen.has(d.prompt)) return false;
        seen.add(d.prompt);
        return true;
      })
      .map(d => ({
        prompt: d.prompt,
        market: d.market,
        propertyType: d.property_type,
        brokerRole: d.broker_role,
        evidence: d.evidence,
      }));
  }, [filteredData]);

  return {
    filters,
    setFilters,
    filteredData,
    markets,
    propertyTypes,
    brokerRoles,
    entityTypes,
    stats,
    allBrokerages,
    topBrokerages,
    allBrokers,
    topBrokers,
    promptData,
    blindSpots,
    isLoading,
    error,
    dataLoaded,
    refetch,
  };
}
