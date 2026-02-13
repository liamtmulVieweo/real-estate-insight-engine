

# Landing Page Updates

## 1. Move Methodology Link Below Leaderboard Button (Hero)
**File:** `src/components/landing/Hero.tsx`
- Change the CTA container from `flex-row` to a stacked vertical layout
- "View Market Leaderboard" stays as the primary button
- "View Methodology" appears directly below it as a secondary text link

## 2. Update Logo Image
**Files:** `src/components/VieweoLogo.tsx`
- Copy uploaded `Vieweo_logo_1.PNG` to `src/assets/vieweo-logo.png`
- Replace the inline SVG with an `<img>` tag referencing the new asset
- Keep the `className` prop for sizing control
- Both header and footer automatically use the updated component

## 3. Add Privacy Policy Page
**New file:** `src/pages/PrivacyPolicy.tsx`
- Full privacy policy content styled consistently with other pages
- Back-to-home navigation link

## 4. Add Terms of Use Page
**New file:** `src/pages/TermsOfUse.tsx`
- Full terms of use content styled consistently
- Back-to-home navigation link

## 5. Wire Up Routes and Footer Links
**File:** `src/App.tsx`
- Add `/privacy` and `/terms` routes

**File:** `src/pages/Landing.tsx`
- Add "Privacy Policy" and "Terms of Use" links to the footer alongside the existing "Methodology" link

## Files Summary

| File | Action |
|------|--------|
| `src/assets/vieweo-logo.png` | New -- from uploaded image |
| `src/components/VieweoLogo.tsx` | Edit -- replace SVG with img |
| `src/components/landing/Hero.tsx` | Edit -- stack CTAs vertically |
| `src/pages/PrivacyPolicy.tsx` | New -- privacy policy page |
| `src/pages/TermsOfUse.tsx` | New -- terms of use page |
| `src/App.tsx` | Edit -- add 2 routes |
| `src/pages/Landing.tsx` | Edit -- add footer links |

