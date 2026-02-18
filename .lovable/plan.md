

# Enhanced AI Visibility Ledger - Web Search Integration

## Overview
Upgrade the `gemini-lookup` edge function to perform a real web search (via Gemini's grounding/search capability) using the brokerage URL as the starting point. Expand the ledger fields to include aliases, legal suffix, social media profiles, and more. The user flow remains the same: scan -> review/edit -> run analysis.

## Changes

### 1. Update Ledger Fields (types + edge function)

Expand the `LEDGER_KEYS` in `gemini-lookup/index.ts` and the corresponding types to include:

| Field | Key | Description |
|-------|-----|-------------|
| Brokerage Name | `brokerage_name` | Canonical entity name |
| Aliases | `aliases` | Other names / DBAs |
| Legal Suffix | `legal_suffix` | Inc., LLC, LP, etc. |
| Markets Served | `markets_served` | Geographic markets |
| Property Types | `property_types` | Office, Industrial, Retail, etc. |
| Services Offered | `services` | Leasing, Sales, PM, etc. |
| Instagram | `social_instagram` | Instagram profile URL |
| Facebook | `social_facebook` | Facebook page URL |
| YouTube | `social_youtube` | YouTube channel URL |
| LinkedIn | `social_linkedin` | LinkedIn company page URL |
| Google Business Profile | `social_gbp` | Google Business Profile URL |
| Headquarters | `headquarters` | HQ location |
| Year Founded | `year_founded` | Founding year |
| Team Size | `team_size` | Approx. team size |
| Website Description | `website_description` | Tagline / description |

Old fields like `notable_deals`, `specializations`, `certifications`, `target_clients` will be removed to keep the ledger focused.

### 2. Update `gemini-lookup` Edge Function

- Update the prompt to instruct Gemini to use its web search/grounding capability to find real, current information about the brokerage from the provided URL
- Explicitly ask for social media profile URLs
- Ask it to identify the canonical entity name and any aliases
- Keep returning the same JSON structure (`ScanResult` with `results` array)

### 3. Update `LedgerEditor` Component

- Group fields visually into sections:
  - **Identity** (Name, Aliases, Legal Suffix)
  - **Operations** (Markets, Property Types, Services, HQ, Year Founded, Team Size)
  - **Social Profiles** (Instagram, Facebook, YouTube, LinkedIn, Google Business Profile)
  - **Other** (Website Description)
- Social profile fields render as clickable links when populated
- Empty/not-found fields highlighted as before

### 4. Update `analyze-ledger` Edge Function

- Pass the expanded ledger data (including social profiles) into the analysis prompt
- The SALT analysis prompt already receives all ledger fields as a summary string, so new fields will automatically flow into the analysis context
- No structural changes needed to the analysis output format

### 5. Update Types

- No changes to `LedgerItem` interface (it's already generic key/label/answer)
- No changes to `ScanResult` or `AnalysisResult` types

## Technical Details

### Files to modify:
1. **`supabase/functions/gemini-lookup/index.ts`** - Update `LEDGER_KEYS` array and prompt text to request web-grounded search with new fields
2. **`src/components/brokerage/LedgerEditor.tsx`** - Add section groupings and social link rendering
3. **`supabase/functions/analyze-ledger/index.ts`** - Minor prompt update to mention social profiles in the analysis context

### Files unchanged:
- `src/types/brokerage.ts` - Generic `LedgerItem` type works as-is
- `src/hooks/useBrokerageScan.ts` - No changes needed
- `src/pages/AIVisibility.tsx` - No changes needed

### Edge function deployment:
Both `gemini-lookup` and `analyze-ledger` will be redeployed automatically.

