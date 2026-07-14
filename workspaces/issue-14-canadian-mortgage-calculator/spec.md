# Canadian Mortgage Calculator — Spec

**Issue:** #14
**Stack:** React + TypeScript
**Date:** 2026-06-10

## What we're building

A single-page mortgage calculator using Canadian semi-annual compounding conventions. Users enter home price, down payment, interest rate, and amortization period and instantly see mortgage amount, monthly payment, total interest, and a full amortization schedule.

## Key decisions

- **Canadian compounding:** Monthly rate = `(1 + r/2)^(1/6) − 1` as specified.
- **Down payment sync:** `downPctStr` and `downAmtStr` are both controlled inputs; each handler updates the other on change.
- **Home price drives down payment $:** When home price changes, down payment amount re-derives from the current down payment %.
- **Validation:** Errors display inline only after the price field has been filled; no results shown while invalid.
- **CMHC note:** Informational only — no premium calculation.
- **Amortization schedule:** All payment rows grouped by year with yearly subtotals; toggle show/hide.

## Component structure

| File | Purpose |
|------|---------|
| `src/mortgage-utils.ts` | Pure calculation and formatting functions |
| `src/mortgage-calculator.tsx` | Main calculator UI with all input state |
| `src/amortization-table.tsx` | Expandable amortization schedule table |

## Validation rules

| Input | Valid range | Error shown when |
|-------|------------|-----------------|
| Home price | > $0 | Price entered and ≤ 0 |
| Down payment | ≥ $0 and < home price | dp ≥ price |
| Interest rate | 0.01% – 25% | rate ≤ 0 or rate > 25 |
| Amortization | 5 – 35 years | outside range (select enforces) |

## Success checks

- `npm run ci` passes (typecheck + lint + coverage ≥ 80%)
- Down payment % and $ stay in sync as user types
- Monthly payment matches Canadian semi-annual compounding formula
- Amortization schedule shows per-payment rows with yearly subtotals
- CMHC note appears when down payment is below 20%
