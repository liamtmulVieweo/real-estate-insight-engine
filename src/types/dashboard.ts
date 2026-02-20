// Dashboard data types matching the database schema and RPC functions

export interface BrokerageProfile {
  name: string;
  primaryMarkets: string[];
  primaryPropertyTypes: string[];
  primaryRoles: string[];
}

export interface KPI {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export interface DashboardSummary {
  total_mentions: number;
  unique_prompts: number;
  primary_markets_present: number;
  submarkets_present: number;
  market_rank: number | null;
  percentile: number | null;
  missed_markets_count: number;
}

export interface MarketData {
  market: string;
  mentions: number;
  rank: number;
  totalBrokerages: number;
  percentile: number;
  marketSharePct: number;
}

export interface BreakdownData {
  name: string;
  mentions: number;
  rank: number;
  total: number;
  percentile: number;
}

export interface Competitor {
  brokerage: string;
  mentions: number;
  rank: number;
  vs_target_diff: number;
  is_target: boolean;
}

export interface GapMarket {
  market: string;
  peer_count: number;
  top_peers: string[];
  total_peer_mentions: number;
}

export interface GapDimension {
  property_type: string;
  broker_role: string;
  target_share_pct: number;
  market_avg_share_pct: number;
  gap_pct: number;
  opportunity_score: number;
}

export interface PromptIntelligence {
  prompt_hash: string;
  prompt: string;
  market: string;
  property_type: string;
  broker_role: string;
  model: string;
  citation_count: number;
  mentioned_entities: Array<{
    name: string;
    type: string;
    brokerage: string | null;
  }>;
  source_domains: string[];
}

export interface SourceAttribution {
  domain: string;
  target_pct: number;
  competitor_pct?: number;
  target_rank?: number;
  category: string | null;
}

export interface BrokerageMentionTotal {
  brokerage: string;
  total_mentions: number;
  unique_prompts: number;
  markets_present: number;
}

export interface PropertyTypeBreakdown {
  property_type: string;
  mentions: number;
  rank: number;
  total_brokerages: number;
}

export interface Filters {
  market: string;
  propertyType: string;
  role: string;
  brokerage: string;
  state: string;
}
