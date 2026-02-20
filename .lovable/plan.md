
# Add Property Type & Sub-Property Selector to Ledger Editor

## Overview
Add an interactive property type selector with expandable sub-property types to the Ledger Editor on the AI Visibility page. When a user selects a property type card, a panel expands below showing the relevant subtypes as checkable items. The selections replace the current flat text field for "property_types" in the ledger.

## What It Looks Like
- A new "Property Types" section in the Ledger Editor (between the Operations and Social Profiles sections)
- 6 property type cards in a 3-column grid (2-column on mobile): Office, Industrial, Retail, Multifamily, Hospitality, Land/Development
- Each card has an icon, name, and a checkbox
- Clicking a card toggles it and reveals a sub-property panel below with checkable subtypes
- Selected types/subtypes are passed to the analysis as structured data

## Changes

### 1. Create `src/components/brokerage/PropertyTypeSelector.tsx` (NEW)
- New component with the property type taxonomy:
  - **Office**: Class A, Class B, Creative/Flex, Medical Office, Co-Working/Flex, Government/GSA
  - **Industrial**: Warehouse/Distribution, Manufacturing, Cold Storage, Data Center, Flex/R&D, Last-Mile Logistics
  - **Retail**: Strip Center, Power Center, Regional Mall, Single-Tenant NNN, Restaurant/QSR, Mixed-Use Retail
  - **Multifamily**: Garden Style, Mid-Rise, High-Rise, Student Housing, Senior/55+, Affordable/LIHTC
  - **Hospitality**: Full-Service Hotel, Select-Service, Extended Stay, Resort, Boutique/Lifestyle
  - **Land/Development**: Entitled Land, Raw Land, Infill/Redevelopment, Master-Planned, Special Purpose
- Each property type is a clickable card with a checkbox in the top-right corner
- Selecting a type reveals a sub-property panel with individually checkable subtypes
- Props: `selectedTypes` (map of type to selected subtypes), `onChange` callback
- Uses existing UI components: Card-like styling with Tailwind, Checkbox from radix

### 2. Update `src/components/brokerage/LedgerEditor.tsx`
- Add local state `selectedPropertyTypes: Record<string, string[]>` to track selections
- Initialize from the existing `property_types` ledger item (parse comma-separated string if present)
- Insert `<PropertyTypeSelector>` as a new section between Operations and Social Profiles
- When saving, serialize selections back into the `property_types` ledger item as a structured string (e.g., "Office (Class A, Medical Office), Industrial (Warehouse/Distribution)")
- Remove `property_types` from the Operations section keys so it doesn't show as a plain text field

### 3. Update `src/types/brokerage.ts`
- Add `PropertyTypeSelection` interface: `{ type: string; subtypes: string[] }`
- Add optional `property_type_selections?: PropertyTypeSelection[]` to `ScanResult` for structured data pass-through

## Technical Details

### Property Type Taxonomy
```text
Office           -> Class A, Class B, Creative/Flex, Medical Office, Co-Working/Flex, Government/GSA
Industrial       -> Warehouse/Distribution, Manufacturing, Cold Storage, Data Center, Flex/R&D, Last-Mile Logistics
Retail           -> Strip Center, Power Center, Regional Mall, Single-Tenant NNN, Restaurant/QSR, Mixed-Use Retail
Multifamily      -> Garden Style, Mid-Rise, High-Rise, Student Housing, Senior/55+, Affordable/LIHTC
Hospitality      -> Full-Service Hotel, Select-Service, Extended Stay, Resort, Boutique/Lifestyle
Land/Development -> Entitled Land, Raw Land, Infill/Redevelopment, Master-Planned, Special Purpose
```

### Component Structure
- Cards use a 3-column grid (`grid-cols-3`, `grid-cols-2` on mobile)
- Sub-property panel slides in below the grid row with a left accent border and warm background
- Subtypes rendered as checkbox items in an auto-fill grid (`grid-template-columns: repeat(auto-fill, minmax(185px, 1fr))`)
- Uses existing Tailwind theme colors and `Checkbox` component

### Data Flow
- User selects property types and subtypes in the Ledger Editor
- On "Run Analysis", the selections are serialized into the `property_types` ledger item answer string
- The analyze-ledger edge function receives this structured info as part of the ledger results
- No backend changes needed -- the property types flow through as ledger data

### Files to Create
1. `src/components/brokerage/PropertyTypeSelector.tsx`

### Files to Modify
1. `src/components/brokerage/LedgerEditor.tsx` - Add PropertyTypeSelector section, manage state
2. `src/types/brokerage.ts` - Add PropertyTypeSelection interface
