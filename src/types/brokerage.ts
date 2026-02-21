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

// ── Broker-friendly analysis result types ──

export interface DealLost {
  scenario: string;
  why_you_lose: string;
  who_wins_instead: string;
}

export interface BrokerSaltScore {
  pillar: string;
  internal_pillar: string;
  score: number;
  headline: string;
  what_it_means: string;
  evidence: string;
}

export interface TopFix {
  fix_title: string;
  the_problem: string;
  the_fix: string;
  example?: string;
  who_does_this: string;
  time_to_complete: string;
  cost_estimate: string;
  what_changes: string;
  priority: string;
}

export interface CompetitorContext {
  what_winning_firms_do_differently: string[];
  your_advantage: string;
}

export interface ActionPlanWeek {
  week: number;
  actions: string[];
  expected_result: string;
}

export interface MeasuredSignals {
  pq_score: number | string;
  pq_bucket: string;
  word_count_mc: number | string;
  has_author: boolean | string;
  has_schema_org: boolean | string;
  has_contact_link: boolean | string;
  has_about_link: boolean | string;
  salt_anchor: Record<string, number>;
}

export interface PlatformScore {
  platform: string;
  score: number;
  reason: string;
}

export interface AnalysisResult {
  plain_english_summary: string;
  visibility_grade: string;
  visibility_grade_reason: string;
  what_ai_thinks_you_do: string;
  what_you_actually_do: string;
  the_gap: string;
  deals_you_are_losing: DealLost[];
  salt_scores: BrokerSaltScore[];
  top_fixes: TopFix[];
  quick_wins: string[];
  what_is_working: string[];
  competitor_context: CompetitorContext;
  ai_recommends_you_for: string[];
  ai_does_not_recommend_you_for: string[];
  "30_day_action_plan": ActionPlanWeek[];
  platform_scores?: PlatformScore[];
  _measured_signals?: MeasuredSignals;
}
