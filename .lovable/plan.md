

# Add Caching to Improve Loading Speed

## Problem
Currently, every time you navigate to a dashboard page, all data is re-fetched from the database even if it hasn't changed. With ~64,000 records, this causes noticeable delays.

## Solution
The app already uses React Query for data fetching, which has built-in caching, but it's configured with default settings (data is considered "stale" immediately). By telling React Query to keep data fresh for longer, repeat visits will load instantly from cache instead of hitting the database again.

## What Changes

**1. Configure global cache settings** (`src/App.tsx`)
- Set a 10-minute freshness window on all queries so data isn't re-fetched unless it's been at least 10 minutes
- Keep cached data in memory for 30 minutes after the last component using it unmounts

**2. Add longer cache times for slow/stable data** (`src/hooks/useDashboardData.ts`)
- Filter options (markets, property types, roles, brokerages) rarely change, so cache them for 30 minutes
- Market rankings and original brokerage names (which fetch all rows) also get 30-minute cache
- Dashboard-specific queries (summary, competitors, prompts) inherit the 10-minute global default

**3. Cache the Vieweo dashboard data** (`src/hooks/useVieweoData.ts`)
- Move from raw `useEffect` fetching to React Query so it benefits from the same caching
- Cache Vieweo data for 10 minutes

## Expected Impact
- First visit: same speed as today
- Switching between pages or returning to the dashboard: near-instant (data served from cache)
- Changing filters within cached data: instant (no re-fetch needed)

## Technical Details

Global QueryClient config change:
```text
staleTime: 10 * 60 * 1000   (10 min - don't refetch if data is younger)
gcTime:    30 * 60 * 1000   (30 min - keep in memory after unmount)
```

Per-query overrides for rarely-changing data (filter lists, market rankings):
```text
staleTime: 30 * 60 * 1000   (30 min)
```

For `useVieweoData.ts`, the raw `useState`/`useEffect` fetch will be wrapped with `useQuery` so it participates in the same cache system.

## Files Changed
- `src/App.tsx` (QueryClient default options)
- `src/hooks/useDashboardData.ts` (per-query staleTime on stable queries)
- `src/hooks/useVieweoData.ts` (migrate to useQuery for caching)

