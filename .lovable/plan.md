

# UI Label Updates for Dashboard Tables

## Overview
Add clear labels and improve formatting across three dashboard table components for better readability on both mobile and desktop.

## Changes

### 1. Market Visibility (`src/components/dashboard/MarketVisibility.tsx`)
- **Mobile**: Add explicit "Percentile:" and "Rank:" inline labels in the 2-column grid rows. Currently percentile is shown without a label and rank lacks the word "Rank:".
  - Row 2 left: add `Percentile:` label before the percentile value, move share to its own line or keep combined
  - Row 2 right: add `Rank:` label before `#N of M`
- **Desktop**: No changes needed (headers already provide context)

### 2. Property Type Breakdown (`src/components/dashboard/PropertyTypeBreakdown.tsx`)
- **Mobile**: Add `Rank:` inline label before the rank value in the grid row
- **Both mobile and desktop**: Apply Title Case formatting to `item.property_type` using a helper function (e.g., `"industrial"` becomes `"Industrial"`, `"multi-family"` becomes `"Multi-Family"`)

### 3. Competitive Rankings (`src/components/dashboard/CompetitiveRankings.tsx`)
- **Mobile**: Add a single-line compact header row that is visible on mobile (currently headers are hidden below `sm`). The header will show: `Rank | Brokerage | Mentions | vs You` in a smaller font (`text-[11px]`) to fit on one line without wrapping.
- Change the `thead` from `hidden sm:table-header-group` to always visible, with reduced font size on mobile (`text-[11px] sm:text-xs`)

## Technical Details

### Files to modify:
1. `src/components/dashboard/MarketVisibility.tsx` - Add "Percentile:" and "Rank:" labels in mobile grid
2. `src/components/dashboard/PropertyTypeBreakdown.tsx` - Add "Rank:" label in mobile grid; add `toTitleCase()` helper for property type names
3. `src/components/dashboard/CompetitiveRankings.tsx` - Make header row always visible with compact font on mobile

### Title Case helper:
```typescript
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
```

### Competitive Rankings header change:
```tsx
// Change from hidden on mobile to always visible with smaller text
<thead>
  <tr className="border-b border-border">
    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-[11px] sm:text-xs w-16">Rank</th>
    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-[11px] sm:text-xs">Brokerage</th>
    <th className="text-right py-2 px-3 font-medium text-muted-foreground text-[11px] sm:text-xs">Mentions</th>
    <th className="text-right py-2 px-3 font-medium text-muted-foreground text-[11px] sm:text-xs whitespace-nowrap">vs You</th>
  </tr>
</thead>
```

