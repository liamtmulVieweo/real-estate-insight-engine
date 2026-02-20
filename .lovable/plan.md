

# Update AI Visibility Dashboard to Broker-Friendly Output

## Overview
The analyze-ledger prompt and output schema are being completely redesigned for a broker audience. No more technical jargon -- everything is written in plain business language about deals, leads, and competitors. The AnalysisView component gets a full rewrite to match.

`scan-website` stays exactly as-is. No changes needed there.

## What Changes

### 1. Replace `supabase/functions/analyze-ledger/index.ts`
- New `buildFactBlock()` that translates raw signals into plain-English interpretations (e.g., "CRITICAL: Almost no content" instead of "word_count_mc: 180")
- New `buildPrompt()` replacing `buildAnalysisPrompt()` with broker-audience rules: never use schema.org, E-E-A-T, YMYL, etc. Every finding must answer "What business am I losing?"
- New system message: "You are a commercial real estate business advisor"
- Completely new output JSON schema with broker-friendly fields:
  - `plain_english_summary`, `visibility_grade` (A-F), `what_ai_thinks_you_do`, `the_gap`
  - `deals_you_are_losing` (specific prospect queries they miss)
  - `salt_scores` with renamed pillars: Specialty Clarity, Proof of Expertise, Market Specificity, Credibility Signals
  - `top_fixes` with who_does_this, time_to_complete, cost_estimate
  - `quick_wins`, `what_is_working`, `competitor_context`
  - `ai_recommends_you_for` / `ai_does_not_recommend_you_for`
  - `30_day_action_plan` (week-by-week)
- Validation changes from `overall_score` check to `plain_english_summary` check
- `_measured_signals` now also includes `has_contact_link` and `has_about_link`
- Fallback signals use `false`/`0` instead of `"unknown"` for boolean/numeric fields
- `computeSaltAnchor()` stays identical

### 2. Update `src/types/brokerage.ts`
- Replace `AnalysisResult` with new broker-friendly interface matching the new schema
- Remove old interfaces no longer needed: `SALTPillarScore`, `RecommendedAction`, `IntentCoverage`, `HyperspecificInstruction`, `PromptCoverage`, `MarketOpportunity`, `AnalysisSummary`, `FactorScore`, `FixLibraryItem`
- Add new interfaces: `DealLost`, `BrokerSaltScore`, `TopFix`, `CompetitorContext`, `ActionPlanWeek`, `MeasuredSignals` (updated)
- Keep `LedgerItem`, `PropertyTypeSelection`, `SiteSignals`, `ScanResult` unchanged

### 3. Replace `src/components/brokerage/AnalysisView.tsx`
Complete UI rewrite. No more sub-component imports (OverallScore, RecommendedActions, etc.). All rendering inline in one file with these sections:
1. **The Verdict** -- Letter grade (A-F) with color coding + plain English summary
2. **The Gap** -- What AI thinks vs what you actually do
3. **Deals Being Lost** -- Specific prospect queries going to competitors
4. **Quick Wins** -- Actions doable in under 1 hour
5. **SALT Scores** -- 4 pillars with score bars, headlines, and evidence
6. **Top Fixes** -- Fix list with priority badges, who does it, time/cost estimates
7. **AI Recommends / Skips** -- Side-by-side cards
8. **Competitor Context** -- What winning firms do differently
9. **30-Day Action Plan** -- Week-by-week timeline
10. **What's Working** -- Positive signals
11. **Website Health Check** -- Measured signals as plain-English diagnostic items

### 4. Update `src/hooks/useBrokerageScan.ts`
- The hook's analyze() validation changes: remove `overall_score` check since the new schema uses `plain_english_summary` as the validity marker
- Keep the existing scan flow (gemini-lookup + scan-website in parallel) -- do NOT use the stub `fetchLedgerItems` from the provided code
- Keep current scan() signature `(url: string)` since gemini-lookup extracts brokerage name
- Keep `setScanResult` export and `analyze(editedResult: ScanResult)` signature for LedgerEditor compatibility

### 5. Update `src/pages/AIVisibility.tsx`
- No changes needed -- the page just passes data between hook and components

### 6. Analysis sub-components become unused
The following files under `src/components/brokerage/analysis/` will no longer be imported but can be left in place (no breaking impact):
- OverallScore.tsx, RecommendedActions.tsx, PromptCoverageSection.tsx, MarketOpportunitySection.tsx, SummarySection.tsx, HyperspecificInstructions.tsx, IntentMonitoring.tsx

## Technical Details

### Files to Modify
1. `supabase/functions/analyze-ledger/index.ts` -- Replace prompt + output schema + handler
2. `src/types/brokerage.ts` -- Replace AnalysisResult and related interfaces
3. `src/components/brokerage/AnalysisView.tsx` -- Complete rewrite with broker-friendly UI
4. `src/hooks/useBrokerageScan.ts` -- Update analyze() validation check

### New AnalysisResult Interface (key fields)
```text
plain_english_summary: string
visibility_grade: "A" | "B" | "C" | "D" | "F"
visibility_grade_reason: string
what_ai_thinks_you_do: string
what_you_actually_do: string
the_gap: string
deals_you_are_losing: Array<{ scenario, why_you_lose, who_wins_instead }>
salt_scores: Array<{ pillar, internal_pillar, score, headline, what_it_means, evidence }>
top_fixes: Array<{ fix_title, the_problem, the_fix, example, who_does_this, time_to_complete, cost_estimate, what_changes, priority }>
quick_wins: string[]
what_is_working: string[]
competitor_context: { what_winning_firms_do_differently: string[], your_advantage: string }
ai_recommends_you_for: string[]
ai_does_not_recommend_you_for: string[]
30_day_action_plan: Array<{ week, actions, expected_result }>
_measured_signals?: MeasuredSignals
```

### Grade Color Mapping
- A = green, B = blue, C = yellow, D = orange, F = red

### Website Health Check (from _measured_signals)
4 plain-English diagnostic items:
- "Does AI understand what you do?" (word_count >= 500)
- "Can AI tell who runs this firm?" (has_author)
- "Does your site look credible to AI?" (has_contact + has_about)
- "Is AI getting clean signals from your site?" (has_schema_org)

