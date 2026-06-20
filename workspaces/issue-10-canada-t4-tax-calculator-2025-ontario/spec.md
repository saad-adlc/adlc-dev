# Spec: Canada T4 Tax Calculator (2025 — Ontario)

## Summary
Standalone React calculator for full-time T4 employees in Ontario. User enters either an hourly rate + hours/week, or an annual salary directly. The app computes CPP, EI, and 2025 federal + Ontario provincial income tax with a full bracket-by-bracket breakdown and totals. All results update live on input change.

## Stack
React 18 + TypeScript (strict) + Vite + Vitest

## Input modes
- **Annual**: direct gross salary entry
- **Hourly**: hourly rate ($/hr) + hours/week → gross = rate × hours × 52

## 2025 Calculation constants
| Deduction | Parameter | Value |
|-----------|-----------|-------|
| CPP | Employee rate | 5.95% |
| CPP | Max pensionable earnings | $73,200 |
| CPP | Basic exemption | $3,500 |
| CPP | Max employee contribution | $4,145.50 |
| EI | Employee rate | 1.64% |
| EI | Max insurable earnings | $65,700 |
| EI | Max employee premium | $1,077.48 |
| Federal | Basic personal amount | $16,129 |
| Ontario | Basic personal amount | $11,865 |

## Federal income tax brackets (2025)
| Range | Rate |
|-------|------|
| $0 – $57,375 | 15% |
| $57,375 – $114,750 | 20.5% |
| $114,750 – $158,519 | 26% |
| $158,519 – $220,000 | 29% |
| $220,000+ | 33% |

## Ontario provincial income tax brackets (2025)
| Range | Rate |
|-------|------|
| $0 – $51,446 | 5.05% |
| $51,446 – $102,894 | 9.15% |
| $102,894 – $150,000 | 11.16% |
| $150,000 – $220,000 | 12.16% |
| $220,000+ | 13.16% |

## Calculation formulas
- **CPP**: `min((min(gross, 73200) − 3500) × 0.0595, 4145.50)` if gross > 3500 else 0
- **EI**: `min(min(gross, 65700) × 0.0164, 1077.48)`
- **Federal taxable income**: `max(0, gross − 16129)`, taxed through brackets
- **Ontario taxable income**: `max(0, gross − 11865)`, taxed through brackets
- **Net annual**: `gross − (CPP + EI + federal tax + Ontario tax)`
- **Net monthly**: `net annual ÷ 12`
- **Net per paycheque**: `net annual ÷ 26`

## Output (results panel)
1. Gross income
2. CPP deduction
3. EI deduction
4. Federal tax — 5 bracket rows (rate, range, amount taxed, tax)
5. Ontario provincial tax — 5 bracket rows
6. Total deductions
7. Net take-home: annual, monthly, per paycheque (26 pays/year)

## Validation
- No negative or zero values accepted
- Results only shown when inputs are valid

## Assumptions
- Basic personal amount is the only tax credit applied
- Biweekly pay schedule (26 pays/year)
- No QPP, no Quebec-specific logic

## Out of scope
- Part-year employment, additional credits (RRSP etc.), other provinces, other tax years

## File map
| Path | Purpose |
|------|---------|
| `src/utils/tax-calc.ts` | CPP, EI, bracket calculation functions |
| `src/utils/tax-calc.test.ts` | Unit tests for all calc functions |
| `src/components/input-panel.tsx` | Mode toggle + validated inputs |
| `src/components/results-panel.tsx` | Deduction rows, bracket tables, totals |
| `src/components/results-panel.test.tsx` | Component rendering tests |
| `src/App.tsx` | Root: mounts InputPanel + ResultsPanel |

## Test requirements
- Unit tests: `calculateGrossFromHourly`, `calculateCpp`, `calculateEi`, `calculateFederalTax`, `calculateOntarioTax`, `calculateTaxResult`
- Component tests: bracket row count, gross/total values rendered
- Coverage: ≥ 80% lines, functions, branches, statements
