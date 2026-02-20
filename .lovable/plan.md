

# FAQ Page Implementation

## Overview
Create a dedicated FAQ page at `/faq` with all the provided CRE AI visibility Q&A content, plus add a compressed FAQ preview section to the Landing page.

## Changes

### 1. Create FAQ Page Component (`src/pages/FAQ.tsx`)
- Header with Vieweo logo and "Back to Home" button (same pattern as Methodology page)
- Hero section with the "What Makes AI Visibility Different" intro content
- Accordion-based FAQ organized into 4 categories:
  - **Discovery and Positioning** (3 questions)
  - **Competition and Market Position** (2 questions)
  - **Client Behavior and Lead Generation** (2 questions)
  - **Business Impact** (1 question)
  - **Practical Improvements** (2 questions)
- Footer with nav links (same as Methodology page)

### 2. Create Compressed Landing FAQ Section (`src/components/landing/FAQPreview.tsx`)
- Show 3-4 of the most impactful questions in a compact accordion
- "View All FAQs" button linking to `/faq`
- Clean white background section matching existing landing page style

### 3. Wire Up Routes and Navigation
- Add `/faq` route in `App.tsx`
- Add `FAQPreview` to Landing page (between Features and EmailSignup)
- Export `FAQPreview` from `src/components/landing/index.ts`
- Add "FAQ" link to Landing page footer

## Technical Details

### Files to create:
1. `src/pages/FAQ.tsx` - Full FAQ page with all content in categorized accordions
2. `src/components/landing/FAQPreview.tsx` - Compressed 3-4 question preview for landing page

### Files to modify:
1. `src/App.tsx` - Add `/faq` route
2. `src/pages/Landing.tsx` - Add `FAQPreview` component and footer link
3. `src/components/landing/index.ts` - Export `FAQPreview`

### Component patterns:
- Uses existing `Accordion` UI component (already in the project)
- Follows Methodology page layout pattern for header/footer
- Follows SubscriptionFAQ styling for accordion appearance

