export interface LedgerItem {
  key: string;
  label: string;
  answer: string;
}

export interface PropertyTypeSelection {
  type: string;
  subtypes: string[];
}

export interface ScanResult {
  brokerage_name: string;
  website_url: string;
  results: LedgerItem[];
  property_type_selections?: PropertyTypeSelection[];
}

// SALT pillars: Semantic, Authority, Location, Trust
export interface SALTPillarScore {
  pillar: "Semantic" | "Authority" | "Location" | "Trust";
  score: number;
  summary: string;
  details: string[];
}

export interface RecommendedAction {
  id: string;
  title: string;
  pillar: "Semantic" | "Authority" | "Location" | "Trust";
  priority: "high" | "medium" | "low";
  affected_urls?: string[];
  issue: string;
  why_it_matters: string;
  what_to_do: string[];
  how_to_know_done: string[];
}

export interface IntentCoverage {
  intent_id: string;
  intent_name: string;
  status: "Eligible" | "Needs Work" | "Not Yet Eligible";
  prompts: string[];
  solution_fixes: {
    fix_name: string;
    description: string;
  }[];
}

export interface HyperspecificInstruction {
  id: string;
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
  visibility_snapshot: string[];
  fix_categories: string[];
  conclusion: string;
}

export interface AnalysisResult {
  overall_score: number;
  salt_scores: SALTPillarScore[];
  recommended_actions: RecommendedAction[];
  intent_coverage: IntentCoverage[];
  hyperspecific_instructions: HyperspecificInstruction[];
  prompt_coverage: PromptCoverage;
  market_opportunity: MarketOpportunity;
  summary: {
    blocking_issues: string[];
    key_unlocks: string[];
  };
  analysis_summary: AnalysisSummary;
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
