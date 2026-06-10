# Equipment Depreciation Calculator — Implementation Spec

**Issue:** #8  
**Stack:** React + TypeScript  
**Workspace:** `workspaces/issue-8-equipment-depreciation-calculator/`  
**Date:** 2026-06-09  

## Summary
Standalone React calculator that computes a year-by-year depreciation schedule from user inputs and displays results as a table and SVG bar chart, updating reactively on every input change.

## Inputs
| Field | Type | Constraint |
|-------|------|-----------|
| Asset cost | number | > 0 |
| Salvage value | number | ≥ 0, < cost; defaults to 0 |
| Useful life | integer | > 0 |
| Depreciation method | enum | straight-line \| declining-balance |

## Validation (inline, no submit)
- NaN / non-finite / ≤ 0 cost → error, no table/chart
- Negative or non-finite salvage → error
- Salvage ≥ cost → error
- Non-positive or non-integer life → error

## Calculation
- **Straight-line:** `annual = (cost − salvage) / life` — equal each year
- **200% Declining balance:** `annual = bookValue × (2 / life)`, floored so bookValue ≥ salvage; final year forces bookValue exactly to salvage

## Output
- **Table:** Year | Annual Depreciation | Accumulated Depreciation | Book Value
- **Chart:** SVG bar chart — book value at end of each year, proportional to cost
- Both update immediately on any input change

## Architecture
```
App.tsx               ← holds DepreciationInputs state, computes schedule
components/
  DepreciationForm    ← controlled inputs + inline error
  DepreciationTable   ← schedule rows
  DepreciationChart   ← SVG bar chart
utils/
  depreciation.ts     ← pure functions (validate, calcSL, calcDB)
```
CSS Modules for all component-specific styles, App.css for global layout.

## Success criteria
- `npm run ci` passes (typecheck + lint + test with 80% coverage threshold)
- Final year book value equals salvage for both methods
- Invalid inputs show error, hide table/chart
