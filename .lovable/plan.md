

# Mobile UI Update for CRE Dashboard Tables

## Overview
Adopt the Resi project's mobile-first table design for Market Visibility, Property Types, and Competitive Rankings. On mobile (below `sm` breakpoint), table headers are hidden and each row becomes a compact 2-column grid showing all data points with inline labels. Desktop layout remains unchanged.

## Changes

### 1. Market Visibility (`src/components/dashboard/MarketVisibility.tsx`)
- Import `useIsMobile` hook
- Hide all table headers except "Market" on mobile using `hidden sm:table-cell`
- On mobile, render each row as a single `td` with `colSpan` containing a 2-column grid:
  - Row 1: Market name (left), Mentions with label (right)
  - Row 2: Share + Percentile (left), Rank with "of N" (right)
- Desktop rows stay exactly as they are today

### 2. Property Type Breakdown (`src/components/dashboard/PropertyTypeBreakdown.tsx`)
- Import `useIsMobile` hook
- Hide Mentions, Composition, Rank headers on mobile with `hidden sm:table-cell`
- On mobile, render each row as a 2-column grid:
  - Row 1: Property type name (left), Mentions with label (right)
  - Row 2: Composition % (left), Rank with "of N" (right)
- Desktop rows unchanged

### 3. Competitive Rankings (`src/components/dashboard/CompetitiveRankings.tsx`)
- Import `useIsMobile` hook
- Make the header stack vertically on mobile: title/description above, full-width search below (using `flex-col md:flex-row`)
- Search input becomes `w-full md:w-64`
- Table headers use smaller text (`text-xs`) and `whitespace-nowrap`
- Rank badge shrinks from `w-8 h-8` to `w-6 h-6` with `text-xs` on mobile
- Reduce cell padding on mobile for tighter layout

## Technical Details

### Files to modify:
1. `src/components/dashboard/MarketVisibility.tsx` - Add mobile 2-column grid row layout
2. `src/components/dashboard/PropertyTypeBreakdown.tsx` - Add mobile 2-column grid row layout
3. `src/components/dashboard/CompetitiveRankings.tsx` - Stack header, compact table cells

### Pattern (from Resi):
```tsx
{isMobile ? (
  <td colSpan={5} className="py-3 sm:hidden">
    <div className="grid grid-cols-2 gap-y-1">
      <span className="font-medium text-foreground text-[13px]">{market}</span>
      <span className="text-right text-[13px]">
        <span className="text-muted-foreground text-[11px]">Mentions: </span>
        {mentions}
      </span>
      ...
    </div>
  </td>
) : (
  // existing desktop cells
)}
```

### Dependency:
- Uses existing `useIsMobile` hook from `src/hooks/use-mobile.tsx` (breakpoint 768px)

