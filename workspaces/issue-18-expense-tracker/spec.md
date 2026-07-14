# Spec: Expense Tracker (Issue 18)

## Summary
Single-page React app for logging expenses with persistent localStorage storage.
Two tabs: Dashboard (charts + summary) and Expense List (table + form).

## Data model
- `Expense`: id (string), amount (number), category (string), date (string ISO), notes (string)
- `Category`: id (string), name (string)

## State
React `useState` + `useCallback` hooks; persisted to localStorage via custom hook.

## Charts
SVG-based donut chart and line chart (Recharts not installed in scaffold).

## Key modules
| File | Purpose |
|------|---------|
| `types.ts` | Shared TypeScript interfaces |
| `storage.ts` | localStorage read/write helpers |
| `csv.ts` | CSV generation + download |
| `chart-data.ts` | Pure functions deriving chart-ready data |
| `use-expense-store.ts` | State hook (expenses, categories, filter) |

## Acceptance mapping
1. Add expense form → `add-expense-form.tsx`
2. Category CRUD → `category-manager.tsx`
3. Filtered table + total → `expense-table.tsx`
4. Donut chart → `donut-chart.tsx`
5. Line chart → `line-chart.tsx`
6. CSV export → `csv.ts` + button in `expense-table.tsx`
7. localStorage persistence → `use-expense-store.ts`
8. Delete expense → row action in `expense-table.tsx`
9. Empty states → handled in each component

## Verification
`npm run ci` → typecheck + lint + test coverage ≥ 80%
