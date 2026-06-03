# Spec: US Self-Employed Tax Savings Calculator (Lightweight)

**Issue:** #TBD
**Stack:** React
**Branch:** `feature/issue-tbd-self-employed-tax-calculator`
**Workspace:** `workspaces/issue-tbd-self-employed-tax-calculator/`
**Date:** 2026-06-03

## What we're building
A lightweight standalone React (Vite + TypeScript) single-page app for US self-employed filers to estimate their 2025 federal tax savings. The user enters filing status, gross income, state, and dependents. The app instantly shows their SE tax, the automatic 50% SE deduction, QBI deduction, and net tax savings — no optional toggles, no multi-step flow.

## Acceptance criteria
1. [ ] User can select filing status (Single, MFJ, MFS, HoH) and enter gross income, state, and dependents
2. [ ] App calculates SE tax (15.3% on 92.35% of net income) and the 50% SE tax deduction automatically
3. [ ] App calculates QBI deduction (20% of net SE income, 2025 thresholds)
4. [ ] App displays a single results card: taxable income, SE tax, federal income tax, and total tax savings vs. no-deductions baseline
5. [ ] Results update on input change (no submit button)
6. [ ] Inputs validated: no negatives, income <= $10M, dependents 0-20
7. [ ] Unit tests cover all calculation functions at >= 80% line coverage

## Files to create
| Path | Purpose |
|------|---------|
| `src/constants/tax2025.ts` | 2025 brackets, SE rate, QBI thresholds, standard deductions |
| `src/utils/taxCalculations.ts` | Pure functions: SE tax, income tax, QBI, total savings |
| `src/utils/taxCalculations.test.ts` | Unit tests |
| `src/components/CalculatorForm.tsx` | Inputs: filing status, income, state, dependents |
| `src/components/ResultsCard.tsx` | Single results card |
| `src/App.tsx` | Root — wires form + results |
| `src/main.tsx` | Vite entry |
| `index.html` | HTML shell |
| `vite.config.ts` | Vite + React config |
| `package.json` | Minimal deps only |

## Files to modify
None — new standalone app.

## Files NOT to touch
- Everything not listed above

## Dependencies
- `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`
- No UI component libraries — plain CSS only

## Test requirements
- Unit tests for `calcSETax`, `calcFederalIncomeTax`, `calcQBIDeduction`, `calcTotalSavings`
- One reference scenario: single filer, $80k income, no dependents
- Coverage target: 80% lines minimum

## Assumptions
- State field collected but not used in calculations (v1)
- Standard deduction always applied — no itemized option
- No optional deductions (retirement, health insurance, home office) — out of scope for lightweight version
- Constants from IRS Rev. Proc. 2024-40

## Out of scope
- Optional deductions (401k, HSA, home office)
- State income tax
- Itemized deductions, AMT, credits
- Side-by-side comparison panel
- Submit button / multi-step flow
