

# Add SALT Breakdown + Platform Scores to AI Visibility Dashboard

Updates to the previously approved plan, adding three changes to the analysis view and backend.

## Changes

### 1. Remove Letter Grade, Use SALT Score as Primary Metric
- Remove the visibility grade badge (A/B/C/D/F) from the verdict card
- Remove the `gradeColor` helper function
- The SALT score (already present) becomes the sole primary metric
- Keep `visibility_grade_reason` text as the subtitle under the summary (rename display to just "reason" context)

### 2. Add SALT Pillar Breakdown to Verdict Card
- Show the 4 individual SALT pillar scores (Semantic, Authority, Location, Trust) as compact mini-bars directly below the overall SALT score in the verdict card
- Each pillar displays: name, numeric score, and a small color-coded bar
- Remove the standalone "How AI Evaluates Your Firm" section (section 5) since the pillar details are now in the verdict -- the detailed cards with headline/evidence/what_it_means remain available further down or are folded into the compact display
- The detailed SALT cards (with headline, evidence, what_it_means) move below the verdict as a collapsible/expandable section

### 3. Add Platform-Specific Visibility Scores
- New "Visibility by Platform" card showing estimated scores for ChatGPT, Gemini, and Google AI Overviews
- Each platform gets a score (0-100), a one-line reason, and a color-coded score bar
- Platform icons/labels differentiate the three

## Files Modified

### `src/types/brokerage.ts`
- Add `PlatformScore` interface: `{ platform: string; score: number; reason: string }`
- Add optional `platform_scores?: PlatformScore[]` field to `AnalysisResult`

### `supabase/functions/analyze-ledger/index.ts`
- Add `platform_scores` to the JSON output schema in `buildPrompt()`:
```text
"platform_scores": [
  { "platform": "ChatGPT", "score": <0-100>, "reason": "<one sentence>" },
  { "platform": "Gemini", "score": <0-100>, "reason": "<one sentence>" },
  { "platform": "Google AI Overviews", "score": <0-100>, "reason": "<one sentence>" }
]
```
- The prompt instructs the model to estimate based on how each platform weighs different signals (content depth vs structured data vs web authority)
- Keep `visibility_grade` in the prompt output for backwards compatibility but it will no longer be displayed

### `src/components/brokerage/AnalysisView.tsx`
- **Verdict card**: Remove letter grade div and `gradeColor` function. Restructure to show:
  - SALT overall score (large, color-coded) on the left
  - 4 mini pillar bars (Semantic, Authority, Location, Trust) below the score, each showing label + number + thin bar
  - Summary text + reason on the right
- **Remove standalone SALT section** (section 5, lines 200-223) -- pillar detail is now in the verdict
- **Add new "Visibility by Platform" card** after the verdict, showing ChatGPT/Gemini/Google AI Overviews with score bars and reason text
- Keep all other sections unchanged

## Technical Details

### Platform Score Estimation Logic (in prompt)
The AI model estimates visibility per platform based on:
- **ChatGPT**: Weighs content depth, authority signals, named expertise
- **Gemini**: Weighs web presence breadth, structured data, freshness
- **Google AI Overviews**: Weighs traditional quality signals, credibility, market specificity

### Verdict Card Layout
```text
+--------------------------------------------------+
| [72]        Semantic  65 ====---                  |
| SALT        Authority 48 ===----     Summary text |
| Score       Location  50 ===----     here...      |
|             Trust     72 ======-                  |
|                                      Reason text  |
+--------------------------------------------------+
```

### Color Thresholds (unchanged)
- Green: score >= 70
- Yellow: score >= 50
- Red: score < 50
