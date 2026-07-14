# Spec: Tip Calculator (Issue #28)

## Summary
Real-time tip calculator — bill amount input + 4 preset tip buttons → instant total.

## Functional requirements

| # | Requirement |
|---|-------------|
| 1 | Bill amount input accepts any numeric value (positive, zero, negative) |
| 2 | Four tip buttons: 10%, 15%, 20%, 25% — clicking recalculates total instantly |
| 3 | Total always shows as `$XX.XX` (two decimal places, dollar sign prefix) |
| 4 | Clear button resets bill input and deselects the active tip button |
| 5 | No persistence across page reloads |

## Default state
- Bill input: empty
- Tip button: none selected
- Total: `$0.00`

## Calculation
- `total = bill × (1 + tipPercent / 100)`
- When no tip is selected OR bill is empty/invalid: total = `$0.00`

## Layout (top → bottom)
1. Title: "Tip Calculator" (centered)
2. Labeled number input: "Bill amount"
3. "Select tip percentage" section — 2×2 grid of tip buttons
4. Total card — "Total" label + `$XX.XX` amount
5. Full-width "Clear" button

## Components
- `TipCalculator` — default export, the main calculator component
- `formatCurrency(amount: number): string` — named export helper
- `calculateTotal(bill: number, tipPercent: number): number` — named export helper

## Files
| File | Purpose |
|------|---------|
| `src/tip-calculator.tsx` | Main component + exported helpers |
| `src/tip-calculator.module.css` | CSS Module styles |
| `src/tip-calculator.test.tsx` | Unit + integration tests |
| `src/App.tsx` | Mounts `TipCalculator` |

## Test coverage targets
- `formatCurrency`: zero, positive, negative, decimal rounding
- `calculateTotal`: all 4 tip percentages, zero bill, negative bill
- Component: initial render, real-time update, Clear behavior, edge cases
- Target: ≥ 80% lines, functions, branches, statements

## Out of scope
- Calculation history, split bill, custom tip input, multi-currency
