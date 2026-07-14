# Spec: Mortgage Affordability Checker

**Issue:** #16  
**Date:** 2026-06-12

## Summary

Single-page React app that tells a user whether they can likely afford a mortgage. Inputs: house value, down payment, annual gross income, credit score. Outputs: approval likelihood %, monthly payment estimate, and a plain-English explanation.

## Calculation model

| Step | Formula |
|---|---|
| Loan amount | `houseValue - downPayment` |
| Monthly payment | Standard amortization: `loan × (r × (1+r)^n) / ((1+r)^n − 1)` where `r = 0.05/12`, `n = 300` |
| GDS ratio | `monthlyPayment / (annualIncome / 12)` |
| Affordability score | `min(1, 0.30 × monthlyIncome / monthlyPayment)` |
| Credit factor | `(score − 300) / 600` (range 300–900 → 0–1) |
| Likelihood | `round(affordabilityScore × creditFactor × 100)` |

Credit score below 600 → likelihood = 0, verdict = "Not eligible".

## Verdict thresholds

| Likelihood | Verdict |
|---|---|
| ≥ 75% | Likely approved |
| 50–74% | Borderline |
| 1–49% | Unlikely |
| 0% (score < 600) | Not eligible |

## Validation rules

| Field | Rule |
|---|---|
| House value | Required, > 0 |
| Down payment | Required, ≥ 0 and < house value |
| Annual gross income | Required, > 0 |
| Credit score | Required, 300–900 inclusive |

Invalid inputs show inline errors; results are hidden.

## Layout

- Page title: "Mortgage affordability checker"
- Input card: four stacked labeled number inputs → "Check affordability" button
- Results row (shown only after valid check): two metric cards — approval likelihood (% + verdict label) and estimated monthly payment ($ + "5% rate · 25 years")
- Explanation strip: one-line sentence with GDS% vs 30% target and credit-score assessment

## Files

| File | Purpose |
|---|---|
| `src/mortgage-calculator.ts` | Pure calculation and validation functions |
| `src/mortgage-affordability-checker.tsx` | React UI component |
| `src/mortgage-affordability-checker.module.css` | CSS Module styles |
| `src/mortgage-calculator.test.ts` | Unit tests for pure functions |
| `src/mortgage-affordability-checker.test.tsx` | Component integration tests |

## Acceptance criteria (from issue)

1. User can enter house value, down payment, annual gross income, and credit score
2. Monthly payment computed from (houseValue − downPayment) amortized at 5%, 25 years
3. Affordability passes when monthly payment ≤ 30% of gross monthly income
4. Result shown as approval likelihood % combining GDS ratio and credit-score factor
5. Credit score below 600 → 0% / "Not eligible"
6. Invalid inputs show inline errors and no result
7. Results update on submit with clear verdict label
