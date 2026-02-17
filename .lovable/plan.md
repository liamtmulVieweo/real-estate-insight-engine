

## Plan: Enhance Prompt Peers & Prompt Intelligence Sections

### 1. Rename "Competitors" to "Prompt Peers"
- Update `CompetitorsList.tsx`: Change the `CardTitle` from "Competitors" to "Prompt Peers" and update the description text accordingly.

### 2. Enrich Prompt Peers with Expandable Row Details
Currently each competitor row only shows brokerage name and shared prompt count. We'll add an expandable dropdown for each row showing:

- **Markets they appear in**: Which markets this peer brokerage is mentioned in (from prompts they share with the selected brokerage)
- **Shared prompts preview**: The actual prompt text snippets they co-appear in (first few)

**Database change required**: Create a new RPC `get_co_mention_details` that, given a target brokerage and a peer brokerage, returns:
- The shared prompt texts (with market, property type, broker role)
- Limited to ~10 prompts for performance

```text
get_co_mention_details(target_brokerage, peer_brokerage)
  -> prompt_hash, prompt, market, property_type, broker_role
```

**UI changes to `CompetitorsList.tsx`**:
- Convert each table row into a clickable/expandable row using Collapsible
- When expanded, show:
  - A list of markets (as badges) derived from the shared prompts
  - A scrollable list of shared prompt snippets (truncated text)
- Fetch details lazily only when a row is expanded (using a new hook `useCoMentionDetails`)

### 3. Make Prompt Intelligence Accordion Fully Functional
The accordion expand/collapse already works (it uses `expandedId` state). The improvements:

- The expanded section already shows Market, Property Type, Role, Brokerages Mentioned, and Sources
- These are all functional based on the data from `get_prompt_intelligence` RPC
- **Verify and fix**: Ensure the click handler and expanded content render correctly; the current code looks functional but we'll confirm no issues exist

**If the accordion visually appears broken**, it may be a styling issue -- we'll ensure the button click properly toggles, and the expanded content animates smoothly.

### Technical Summary

| Task | Files Changed |
|------|---------------|
| Rename to "Prompt Peers" | `CompetitorsList.tsx` |
| New RPC for co-mention details | New migration |
| Expandable peer rows with details | `CompetitorsList.tsx`, `useDashboardData.ts` |
| Prompt Intelligence verification | `PromptIntelligence.tsx` (minor fixes if needed) |

### New Database Function

```sql
CREATE OR REPLACE FUNCTION public.get_co_mention_details(
  target_brokerage text, peer_brokerage text
)
RETURNS TABLE(
  prompt_hash text, prompt text, market text, 
  property_type text, broker_role text
)
```

This finds prompts where both the target and peer brokerage appear together, returning up to 10 shared prompts with their metadata.

### Updated CompetitorsList UI

Each row becomes expandable:
```text
#  Brokerage Name     Shared Prompts: 42
   [expanded]
   Markets: [Dallas] [NYC] [Chicago]
   Shared Prompts:
     - "Who are the top office brokers in Dallas?"
     - "Best industrial brokerages in Chicago..."
     - ...
```

