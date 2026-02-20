export interface LedgerItem {
  key: string;
  label: string;
  answer: string;
}

export interface PropertyTypeSelection {
  type: string;
  subtypes: string[];
}

export interface SiteSignals {
  url: string;
  final_url: string;
  status_code: number;
  title: string;
  meta_description: string;
  canonical?: string;
  lang?: string;
  word_count_mc: number;
  heading_count: number;
  outbound_link_count: number;
  total_link_count: number;
  link_to_text_ratio: number;
  repeated_text_score: number;
  filler_hits: number;
  spam_patterns_found: string[];
  has_schema_org: boolean;
  has_author: boolean;
  has_date: boolean;
  has_about_link: boolean;
  has_contact_link: boolean;
  has_policy_links: boolean;
  ad_hint_count: number;
  interstitial_hint: boolean;
  ymyl_risk: string;
  ymyl_categories: string[];
  purpose_guess: string;
  pq_score: number;
  pq_bucket: string;
  red_flags: string[];
  positives: string[];
  mc_excerpt: string;
}

export interface ScanResult {
  brokerage_name: string;
  website_url: string;
  results: LedgerItem[];
  property_type_selections?: PropertyTypeSelection[];
  site_signals?: SiteSignals | null;
}

// SALT pillars: Semantic, Authority, Location, Trust
export interface SALTPillarScore {
  pillar: "Semantic" | "Authority" | "Location" | "Trust";
  score: number;
  confidence?: string;
  summary: string;
  details: string[];
}

export interface RecommendedAction {
  id?: string;
  title: string;
  pillar: "Semantic" | "Authority" | "Location" | "Trust";
  priority: "high" | "medium" | "low";
  evidence_quote?: string;
  affected_urls?: string[];
  issue: string;
  why_it_matters: string;
  what_to_do: string[];
  how_to_know_done: string[];
}

export interface IntentCoverage {
  intent_id?: string;
  intent_name: string;
  status: "Eligible" | "Needs Work" | "Not Yet Eligible";
  why?: string;
  prompts: string[];
  solution_fixes: {
    fix_name: string;
    description: string;
  }[];
}

export interface HyperspecificInstruction {
  id?: string;
  title: string;
  deliverable: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  salt_points: number;
  target_intent: string;
  target_url: string;
  suggested_title: string;
  action_items: string[];
  avoid: string[];
  good_example?: string;
  effect: string;
  dependency?: string;
}

export interface PromptCoverage {
  supported: string[];
  missing: string[];
  blocked: string[];
}

export interface MarketOpportunity {
  submarket: string;
  suggested_title: string;
  headings_description: string;
  required_content: string[];
  avoid: string[];
}

export interface AnalysisSummary {
  visibility_snapshot: string | string[];
  fix_categories?: string[];
  top_blockers?: string[];
  quick_wins?: string[];
  conclusion: string;
}

export interface MeasuredSignals {
  pq_score: number | string;
  pq_bucket: string;
  word_count_mc: number | string;
  has_author: boolean | string;
  has_schema_org: boolean | string;
  salt_anchor: Record<string, number>;
}

export interface AnalysisResult {
  overall_score: number;
  salt_scores: SALTPillarScore[];
  recommended_actions: RecommendedAction[];
  intent_coverage: IntentCoverage[];
  hyperspecific_instructions: HyperspecificInstruction[];
  prompt_coverage: PromptCoverage;
  market_opportunity?: MarketOpportunity;
  summary?: {
    blocking_issues: string[];
    key_unlocks: string[];
  };
  analysis_summary: AnalysisSummary;
  _measured_signals?: MeasuredSignals;
}

// Keep legacy type for backwards compatibility during migration
export interface FactorScore {
  factor: string;
  score: number;
  why: string;
}

export interface FixLibraryItem {
  name: string;
  target_url_pattern: string;
  definition_of_done: string[];
}
