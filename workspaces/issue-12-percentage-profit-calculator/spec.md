# Spec: Percentage Profit Calculator

## Summary
A single-page React calculator where users enter cost and selling prices to see live profit percentage and amount. Results update on every keystroke; no submit button.

## Stack
React 18 + TypeScript 5 (Vite)

## Components and files
| File | Purpose |
|------|---------|
| `src/profit-calculator-utils.ts` | Pure functions: calculateProfit, formatCurrency, formatPercentage, parseNumericInput |
| `src/profit-calculator.tsx` | ProfitCalculator component (mounted in App) |
| `src/profit-calculator.module.css` | CSS Module styles (profit green, loss red, layout) |
| `src/profit-calculator.test.tsx` | Tests: pure functions + component + App coverage |
| `src/App.tsx` | Root, mounts ProfitCalculator |

## Calculations
- Profit %: `(sellingPrice − costPrice) / costPrice × 100`
- Profit amount: `sellingPrice − costPrice`
- Display: 2 decimal places, `$` currency symbol

## Behaviour rules
- Cost must be > 0 and selling must be provided for a result to show
- Empty/zero cost → friendly prompt ("Enter a cost price to calculate")
- Non-numeric input filtered on change → app never shows NaN or Infinity
- Profit → green; loss → red with "loss" label and `−` prefix on percentage
- Clear button resets both inputs and the result display

## Acceptance criteria
1. Cost 100 + selling 125 → **25.00%** and **$25.00**
2. Selling below cost → negative %, red "loss" label
3. Empty/zero cost → prompt, no Infinity/NaN
4. Non-numeric input filtered; app never crashes
5. Clear button resets inputs and result
6. Live update on every keystroke
7. All monetary values: 2 decimal places + `$` symbol

## Out of scope
- Reverse calculation, markup vs margin toggle, multiple currencies, history
