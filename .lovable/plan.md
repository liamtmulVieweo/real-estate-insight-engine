

# Landing Page Tweaks

## 1. Reduce White Space
- **MethodologySection** (`py-24`): Reduce to `py-12 md:py-16` to tighten space above "How It Works"
- **Features** (`py-24`): Reduce to `py-12 md:py-16` to tighten space above "Comprehensive AI Visibility Analytics"

## 2. Remove Em Dashes
Four instances across the landing page sections:

| File | Line | Current | Updated |
|------|------|---------|---------|
| WhySection.tsx | 48 | "visible — or inaccurately represented —" | "visible, or inaccurately represented," |
| WhySection.tsx | 70 | "business impact — step by step" | "business impact, step by step" |
| WhySection.tsx | 101 | "overlook you — and where others are winning" | "overlook you, and where others are winning" |
| Features.tsx | 21 | "focus—whether tenant rep" | "focus, whether tenant rep" |

## Files Changed
- `src/components/landing/MethodologySection.tsx` (padding)
- `src/components/landing/Features.tsx` (padding + em dash)
- `src/components/landing/WhySection.tsx` (3 em dashes)
