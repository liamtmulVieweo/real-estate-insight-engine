

## Source Attribution: Replace Peer Avg with Competitor Comparison

### What Changes

The Source Attribution section currently compares your brokerage against the average of *all* other brokerages. This plan replaces that with a 1:1 competitor comparison where you pick a specific competitor from a searchable dropdown.

### UI Changes

- Remove the "Peer Avg" and "Diff" columns from the source table
- Add a searchable competitor selector (combobox) at the top of the Source Attribution card
- When no competitor is selected, show only the "You %" column
- When a competitor is selected, add a second column showing the competitor's % for each domain
- Combine both domain lists: if one side doesn't appear in a domain, show 0%
- The own-domain pinned card at the top will also show the competitor's % if selected

### Database Changes

**New RPC: `get_source_attribution_vs_competitor`**

Accepts `target_brokerage` and `competitor_brokerage` parameters. Returns a FULL OUTER JOIN of both brokerages' domain data from `domain_attribution_by_brokerage`, joined with `lovable_domains` for category. Missing entries default to 0%.

### Technical Details

1. **New migration** -- create `get_source_attribution_vs_competitor` RPC:
   - Query `domain_attribution_by_brokerage` for target rows and competitor rows
   - FULL OUTER JOIN on domain
   - LEFT JOIN `lovable_domains` for category
   - Return: `domain`, `target_pct`, `competitor_pct`, `category`

2. **New hook** in `useDashboardData.ts` -- `useSourceAttributionVsCompetitor(targetBrokerage, competitorBrokerage)`:
   - Calls the new RPC
   - Only enabled when both brokerages are set

3. **Update `SourceAttribution` type** in `types/dashboard.ts`:
   - Add `competitor_pct` field (optional, for when competitor is selected)
   - Remove `peer_avg_pct`, `diff_pct`, `peer_avg_rank` (no longer needed)

4. **Update `MissedOpportunities.tsx`** (Source Attribution card):
   - Add competitor state and searchable combobox using existing brokerage list
   - Remove "Peer Avg" and "Diff" table columns
   - Add "Competitor %" column when a competitor is selected
   - Update the `SourceTable` component accordingly
   - Update own-domain pinned card to show competitor % instead of peer avg
   - Switch data source: use original `useSourceAttribution` when no competitor, use new hook when competitor selected

5. **Update `Dashboard.tsx`**:
   - Pass `brokerages` list to `MissedOpportunities` so the competitor selector can search it
   - Wire up the new competitor-specific source attribution hook

