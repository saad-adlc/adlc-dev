# Spec: Lease vs Buy Comparison Tool

**Issue:** #TBD
**Stack:** React
**Branch:** `feature/issue-tbd-lease-vs-buy-comparison`
**Workspace:** `workspaces/issue-tbd-lease-vs-buy-comparison/`
**Date:** 2026-06-03

## What we're building
A standalone React application that lets a user enter asset cost, down payment, loan interest rate, lease term, monthly lease payment, and residual/salvage value — then instantly see a side-by-side USD comparison of the total cost of leasing versus buying over the same period. The buy side calculates a standard amortising loan payment and subtracts the residual value from total outlay to produce a true net cost.

## Acceptance criteria
1. [ ] User can enter: asset cost, down payment, lease term (months), monthly lease payment, annual loan rate (%), and residual/salvage value
2. [ ] Results panel shows: monthly loan payment, total lease cost, total buy cost (net of residual), and a clear winner indicator
3. [ ] All monetary values display formatted in USD
4. [ ] Results update live as inputs change (no submit button required)
5. [ ] Invalid or incomplete inputs show a graceful inline message — no crashes
6. [ ] App is fully self-contained (no backend, no external API calls)

## Files to create
| Path | Purpose |
|------|---------|
| `src/App.tsx` | Root component, layout shell |
| `src/components/InputForm.tsx` | All input fields |
| `src/components/ResultsPanel.tsx` | Side-by-side cost comparison display |
| `src/utils/calculations.ts` | Pure functions: loan payment, total lease cost, total buy cost |
| `src/utils/calculations.test.ts` | Unit tests for all calculation functions |
| `src/utils/formatCurrency.ts` | USD formatter utility |
| `index.html` | Vite entry HTML |
| `vite.config.ts` | Vite config |
| `package.json` | Dependencies (React, Vite, TypeScript) |
| `tsconfig.json` | TypeScript config |

## Files to modify
_None — greenfield app._

## Files NOT to touch
- Everything not listed above

## Dependencies
- React 18, TypeScript, Vite, Vitest (unit tests)

## Test requirements
- Unit tests for: `calculateMonthlyLoanPayment`, `calculateTotalLeaseCost`, `calculateTotalBuyCost`
- Coverage target: 80% lines minimum
- Test file location: `src/utils/calculations.test.ts`

## Assumptions
- Loan covers `asset cost − down payment`; amortised over the same number of months as the lease term
- Residual value is subtracted from total buy outlay to reflect asset value retained
- No tax, insurance, or maintenance costs included (finance comparison only)
- App is deployed as a static site (GitHub Pages compatible)

## Out of scope
- Multi-currency support
- Save / export results
- Comparison across multiple lease terms simultaneously
