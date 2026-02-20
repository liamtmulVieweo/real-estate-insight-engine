

# Implement Grounded Backend for AI Visibility Dashboard

## Overview
Apply the new signal-grounded architecture: create the `scan-website` edge function for deterministic site analysis, replace `analyze-ledger` with anchored AI prompts, update the frontend hook and components to support the new data flow. The existing `gemini-lookup` function continues to serve as the ledger data source.

## Changes

### 1. Create `supabase/functions/scan-website/index.ts` (NEW)
- Deterministic HTML scanner using `deno_dom` WASM parser
- Fetches brokerage URL, extracts ~25 measurable signals (word count, heading count, schema.org, author/date signals, link ratios, YMYL risk, ad hints, spam patterns)
- Computes Page Quality (PQ) score 0-100 with no AI
- Returns structured signals object with red flags, positives, and content excerpt
- Handler wrapped in `serve()` with CORS headers

### 2. Replace `supabase/functions/analyze-ledger/index.ts`
- Accepts new optional `site_signals` parameter alongside existing fields
- Adds `computeSaltAnchor()` to derive deterministic SALT scores from signals
- Adds `buildFactBlock()` and `buildAnalysisPrompt()` for grounded AI prompts
- AI constrained to +/-15 deviation from anchors, must cite signal values
- Returns `_measured_signals` metadata for frontend transparency
- Gracefully degrades when `site_signals` is not provided

### 3. Replace `src/hooks/useBrokerageScan.ts`
- `scan()` now takes `(url: string)` -- extracts brokerage name from `gemini-lookup` response (keeping existing UX)
- Runs `scan-website` and `gemini-lookup` in parallel via `Promise.allSettled`
- `scan-website` failure is non-fatal (graceful degradation)
- `analyze()` now passes `site_signals` to the backend
- Stores `site_signals` in `scanResult`

### 4. Update `src/types/brokerage.ts`
- Add `SiteSignals` interface
- Add `site_signals?: SiteSignals | null` to `ScanResult`
- Add optional `confidence` to `SALTPillarScore`
- Add optional `evidence_quote` to `RecommendedAction`, make `id` optional
- Add optional `why` to `IntentCoverage`, make `intent_id` optional
- Update `AnalysisSummary`: add `top_blockers?: string[]`, `quick_wins?: string[]` (keep `fix_categories` for backward compat), allow `visibility_snapshot` as `string | string[]`
- Make `market_opportunity` and `summary` optional in `AnalysisResult`
- Add `_measured_signals` optional field to `AnalysisResult`

### 5. Update `src/components/brokerage/AnalysisView.tsx`
- Make `MarketOpportunitySection` and `SummarySection` rendering handle missing data gracefully (new prompt doesn't always return `market_opportunity` or `summary`)
- Pass `analysis_summary` to SummarySection with fallback data

### 6. Update `src/components/brokerage/analysis/SummarySection.tsx`
- Handle `visibility_snapshot` as `string | string[]`
- Use `top_blockers` as fallback for `blocking_issues`, `quick_wins` for `key_unlocks`
- Keep backward compat with old `fix_categories` field

### 7. Update `src/components/brokerage/analysis/RecommendedActions.tsx`
- Display `evidence_quote` when present (new grounded field)
- Handle missing `id` (use title as key -- already doing this)

### 8. Update `src/components/brokerage/analysis/IntentMonitoring.tsx`
- Display `why` field when present

### 9. Update `src/pages/AIVisibility.tsx`
- Adapt to hook changes (no more `setScanResult` in destructuring)

### 10. Update `supabase/config.toml` -- NOT NEEDED
- Config.toml is auto-managed. The scan-website function will be auto-configured.

## Technical Details

### Compatibility Strategy
All new fields are optional so both old cached results and new results render. Key mappings:
- `summary.blocking_issues` falls back to `analysis_summary.top_blockers`
- `summary.key_unlocks` falls back to `analysis_summary.quick_wins`
- `visibility_snapshot` handles both `string` and `string[]`

### Hook Flow
The hook keeps the same single-URL entry point. `gemini-lookup` extracts the brokerage name (as it does today). The new `scan-website` runs in parallel for signals. If it fails, analysis proceeds without grounding (scores default to 50).

### Files to Create
1. `supabase/functions/scan-website/index.ts`

### Files to Modify
1. `supabase/functions/analyze-ledger/index.ts` (replace)
2. `src/hooks/useBrokerageScan.ts` (replace)
3. `src/types/brokerage.ts` (update interfaces)
4. `src/pages/AIVisibility.tsx` (minor)
5. `src/components/brokerage/AnalysisView.tsx` (handle optional sections)
6. `src/components/brokerage/analysis/SummarySection.tsx` (new fields)
7. `src/components/brokerage/analysis/RecommendedActions.tsx` (evidence_quote)
8. `src/components/brokerage/analysis/IntentMonitoring.tsx` (why field)

