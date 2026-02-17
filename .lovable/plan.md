

## Replace Category Dropdown with Collapsible Sections

### What Changes

The category dropdown filter in the Source Attribution card will be replaced with collapsible (accordion-style) sections. Each category becomes its own expandable section header showing the category name and domain count. Clicking a section expands it to reveal the domain table for that category.

### UI Behavior

- Remove the `Select` dropdown currently used for category filtering
- Remove the `selectedCategory` state and `displayItems` memo (no longer needed)
- Each category from `groupedCategories` renders as a `Collapsible` section
- The trigger shows: category name + domain count (e.g., "Media/News (10)")
- Expanding a section reveals the `SourceTable` for that category's domains
- All sections start collapsed by default
- Multiple sections can be open simultaneously
- The own-domain pinned card and competitor selector remain unchanged
- The outer scrollable container (`max-h-[220px]`) moves to wrap all collapsible sections instead

### Technical Details

**File: `src/components/dashboard/MissedOpportunities.tsx`**

1. Replace `Select` import with `Collapsible, CollapsibleTrigger, CollapsibleContent` from `@/components/ui/collapsible`
2. Remove `selectedCategory` state and `displayItems` memo
3. Replace the category dropdown + single table with a scrollable list of collapsible sections:
   - Each `groupedCategories` entry maps to a `Collapsible` component
   - `CollapsibleTrigger` displays category name, count, and a chevron icon
   - `CollapsibleContent` contains the `SourceTable` for that category's items
4. Keep the `max-h-[220px] overflow-y-auto` wrapper around the collapsible list so the card doesn't grow unbounded

