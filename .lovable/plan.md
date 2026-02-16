
# Animated Loading Screen with Live Progress Steps

Replace the basic spinner loading screens on both dashboards with a polished, Claude-inspired loading experience that shows a simulated progress bar and a live feed of what's happening behind the scenes.

## What the User Will See

A centered loading card with:
- An animated progress bar that fills from 0% to ~95% over a few seconds
- A percentage counter (e.g., "42%") that ticks up smoothly
- A scrolling list of status messages that appear one by one, like:
  - "Connecting to database..."
  - "Fetching market data..."
  - "Aggregating brokerage rankings..."
  - "Crunching 64,000+ records..."
  - "Preparing visualizations..."
- Each step gets a checkmark icon as the next one starts, with subtle fade-in animations
- The Vieweo or CRE logo at the top for branding

This creates the feel of watching a system work in real-time, similar to Claude's "thinking" indicator.

## Files Changed

### New: `src/components/ui/DashboardLoadingScreen.tsx`
A shared loading component used by both dashboards. Accepts:
- `title` -- e.g., "Vieweo Dashboard" or "CRE Dashboard"
- `steps` -- an array of status messages specific to each dashboard

Internally:
- Uses `useState` + `useEffect` with `setInterval` to advance through steps every ~800ms
- Progress bar value is derived from the current step index (step 1 of 5 = 20%, etc.)
- Uses `framer-motion` (already installed) for smooth fade-in of each step and the progress bar fill
- Each completed step shows a green checkmark; the active step shows a pulsing dot
- The percentage number animates smoothly using a counter effect

### Modified: `src/pages/VieweoDashboard.tsx`
- Replace the `<VieweoDashboardLoading />` usage with the new `<DashboardLoadingScreen>` component, passing Vieweo-specific steps like "Loading AI visibility data...", "Aggregating brokerage mentions...", etc.

### Modified: `src/pages/Dashboard.tsx`
- Replace the inline spinner loading block (lines 117-125) with the new `<DashboardLoadingScreen>` component, passing CRE-specific steps like "Loading brokerage list...", "Preparing market rankings...", etc.

## Technical Details

- Progress simulation: The bar advances through steps on a timer. It pauses at ~95% until the actual data finishes loading, then jumps to 100% and the loading screen unmounts naturally (since `isLoading` becomes false).
- No actual progress tracking needed -- the steps are cosmetic/simulated to give the user visual feedback during the real data fetch.
- Uses existing `framer-motion` for `AnimatePresence` and `motion.div` transitions.
- Uses existing Tailwind animation utilities (`animate-pulse`, custom keyframes) plus the project's color palette (`primary`, `muted-foreground`, `status-success`).
