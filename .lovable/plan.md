

# Progressive Loading: Show Key Data First, Load the Rest Silently

## How It Works

The dashboard currently waits for ALL data before showing anything. Instead, we split the data into two tiers:

- **Tier 1 (instant):** The header, filters, KPI cards, and top charts -- what the user sees first
- **Tier 2 (background):** Everything below the fold -- loads silently after the page is already visible

The user sees the dashboard appear quickly with real data at the top. The lower sections show subtle skeleton placeholders that fill in moments later, but since they're off-screen, most users never notice.

---

## CRE Dashboard (`/cre-dashboard`)

### Tier 1 -- Load Immediately (blocks first paint)
- Brokerage list (for the selector dropdown)
- Filter options (markets, property types, roles)
- Dashboard summary (KPI numbers)
- Market rankings (market visibility chart)
- Property type breakdown

### Tier 2 -- Load After First Paint (background, with skeletons)
- Competitive rankings table
- Missed opportunities
- Source attribution
- Prompt intelligence (heaviest query -- pages through all results)
- Broker team breakdown
- Submarkets for brokerage
- Original brokerage names

### How Tier 2 Works
Each Tier 2 hook gets an `enabled` flag that only turns `true` after the Tier 1 data has loaded. React Query then fetches them in the background. The components already accept `isLoading` props and show their own loading states, so the user sees the page with subtle skeleton/spinner placeholders that fill in seamlessly.

---

## Vieweo Dashboard (`/vieweo`)

### Tier 1 -- Load Immediately
- Stats (total records, unique brokers/brokerages, blind spot %)
- Filter options (markets, property types, roles, entity types)
- Top 15 brokerages (default tab)

### Tier 2 -- Load on Tab Activation
- Top brokers data: only fetched when the "Brokers" tab is clicked
- Prompt explorer data: only fetched when the "Prompts" tab is clicked
- Raw data: only fetched when the "Raw Data" tab is clicked

This is the biggest win -- currently all 64,000 rows are downloaded and processed even if the user never clicks those tabs.

---

## Technical Approach

### CRE Dashboard Changes

**`src/pages/Dashboard.tsx`:**
- Add a `tier1Ready` flag: `const tier1Ready = !loadingBrokerages && !loadingSummary`
- Pass `tier1Ready` as the `enabled` condition to all Tier 2 hooks
- No UI changes needed -- components already handle their own loading states

**`src/hooks/useDashboardData.ts`:**
- Add an `enabled` parameter to Tier 2 hooks (competitive rankings, missed opportunities, source attribution, prompt intelligence, broker team)
- These hooks already have `enabled: !!targetBrokerage` -- we just AND it with the tier1Ready flag

### Vieweo Dashboard Changes

**`src/hooks/useVieweoData.ts`:**
- Split the single massive query into a lightweight "bootstrap" query (stats + filters + top brokerages) and separate deferred queries for each tab
- Bootstrap query: SQL aggregation via a new database function that returns stats + top brokerages in one call (~5KB payload vs current ~5MB)
- Tab queries: only fire when their tab is active

**`src/pages/VieweoDashboard.tsx`:**
- Track active tab state
- Pass active tab to the hook so it only fetches the relevant tab's data
- Show skeleton loading in inactive tabs when they're first opened

### New Database Function

**`get_vieweo_bootstrap`** -- a single database function that returns:
- Total record count, unique brokers, unique brokerages, blind spot stats
- Distinct filter values (markets, property types, broker roles, entity types)  
- Top 15 brokerages with mention counts and percentages

All computed server-side with `COUNT`, `GROUP BY`, and `DENSE_RANK`. Returns ~5KB instead of downloading 64,000 rows.

### New Database Function for Tab Data

**`get_vieweo_top_brokers`** -- returns top 20 brokers with their markets and asset classes, computed server-side. Only called when Brokers tab is activated.

**`get_vieweo_prompts`** -- returns prompt explorer data with pagination. Only called when Prompts tab is activated.

---

## Files Changed

- **New migration:** Create `get_vieweo_bootstrap` and `get_vieweo_top_brokers` database functions
- **Modified:** `src/hooks/useDashboardData.ts` -- add `enabled` parameter to Tier 2 hooks
- **Modified:** `src/hooks/useVieweoData.ts` -- split into bootstrap + deferred tab queries
- **Modified:** `src/pages/Dashboard.tsx` -- add tier1Ready gating for Tier 2 hooks
- **Modified:** `src/pages/VieweoDashboard.tsx` -- track active tab, pass to hooks

## What Stays the Same

- All UI components keep their exact same props and rendering
- All numbers and rankings stay identical
- Filter behavior unchanged
- Existing RPC functions for CRE dashboard untouched
