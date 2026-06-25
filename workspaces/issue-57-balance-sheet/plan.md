# Implementation Plan: Balance Sheet

**Branch**: `feature/issue-57-balance-sheet` | **Date**: 2026-06-25 | **Spec**: spec.md

## Summary

Build a client-side-only React+TypeScript balance sheet where users enter line items under Assets,
Liabilities, and Equity. The app keeps running subtotals per section and reports whether Assets
equals Liabilities+Equity (to the cent). Invalid input is flagged and excluded. A two-bar inline
SVG provides a visual sanity check. All state is in-memory using `useState`.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x

**Primary Dependencies**: React, React DOM (no new packages needed)

**Storage**: N/A (in-memory React state only)

**Testing**: Vitest + @testing-library/react + @testing-library/jest-dom

**Target Platform**: Browser (Vite dev/build)

**Project Type**: Single-page web application

**Performance Goals**: Immediate subtotal updates on keystroke (synchronous state update)

**Constraints**: No chart libraries; SVG must be inline. No new npm packages. Each file ≤300 lines,
each function ≤40 lines. CSS Modules only (no inline styles).

**Scale/Scope**: Single page, ~7 line items prefilled, no persistence.

## Constitution Check

- ✅ No hardcoded secrets
- ✅ No eval()
- ✅ Input validation on user-entered amounts
- ✅ Approved stack only (React+TS+Vite+Vitest)
- ✅ No new npm packages
- ✅ Work scoped to `workspaces/issue-57-balance-sheet/`

## Project Structure

```text
workspaces/issue-57-balance-sheet/
├── spec.md
├── plan.md
├── tasks.md
└── src/
    ├── App.tsx                        (mount BalanceSheet)
    ├── balance-types.ts               (LineItem, SectionId)
    ├── balance-utils.ts               (parseAmount, computeTotal, isBalanced, formatMoney)
    ├── balance-utils.test.ts          (pure-function unit tests)
    ├── balance-section.tsx            (section with line items + subtotal)
    ├── balance-section.module.css
    ├── balance-visual.tsx             (two-bar inline SVG)
    ├── balance-visual.module.css
    ├── balance-sheet.tsx              (root component — state + layout)
    ├── balance-sheet.module.css
    └── balance-sheet.test.tsx         (integration tests)
```

**Structure Decision**: Single project — pure frontend, no backend needed. Components are split to
keep each file within the 300-line limit and each function within 40 lines.

## Data Model

```
SectionsState = Record<SectionId, LineItem[]>
  assets:      LineItem[]
  liabilities: LineItem[]
  equity:      LineItem[]

LineItem { id: string; name: string; amount: string }
```

State lives in `BalanceSheet` and is passed down via props. No global state manager needed for
this scope.

## Key Design Decisions

- `amount` is stored as a raw string so the input is always controlled and intermediate
  invalid states (e.g., typing "-") are preserved in the field without triggering calculation
  errors.
- `parseAmount` returns `null` for invalid non-empty strings; callers treat `null` as 0 in sums
  and as an error signal for display.
- `isBalanced` rounds to cents (`Math.round(n * 100)`) to avoid floating-point drift.
- `BalanceSection` renders a `LineItemRow` sub-component to keep the section function ≤40 lines.
- The SVG visual uses `Math.max(|assets|, |claims|, 1)` as the scale denominator to avoid
  division by zero and always fills to the same maximum width.
