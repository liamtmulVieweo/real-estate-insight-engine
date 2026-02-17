

## Accordion Section Improvements

### Changes to `src/components/dashboard/MissedOpportunities.tsx`

**1. Move scrolling inside each accordion section (not the outer wrapper)**

- Remove the outer `max-h-[280px] overflow-y-auto` wrapper around the entire `Accordion`
- Instead, add `max-h-[200px] overflow-y-auto` to the content area inside each `AccordionContent`, so each expanded category scrolls independently

**2. Show aggregate percentages on each accordion header**

- Compute the sum of `target_pct` for all items in each category
- When a competitor is selected, also compute the sum of `competitor_pct` and the difference
- Display these aggregates inline on the `AccordionTrigger`, e.g.:
  - Without competitor: **Media/News (10) -- You: 24.5%**
  - With competitor: **Media/News (10) -- You: 24.5% | CBRE: 18.2% | +6.3%**
- The difference will be color-coded green (positive) or red (negative)

### Technical Details

- In the `groupedCategories` map, compute `targetSum` and `competitorSum` per category using `reduce`
- Render them as small inline text next to the category name inside the trigger
- The `AccordionTrigger` layout stays as a flex row with the category name/count on the left and the aggregate numbers on the right (before the chevron)
- The `SourceTable` inside `AccordionContent` gets wrapped in a scrollable `div` with `max-h-[200px] overflow-y-auto`
