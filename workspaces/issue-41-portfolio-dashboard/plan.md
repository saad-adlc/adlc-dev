# Implementation Plan: Portfolio Dashboard

**Branch**: `feature/issue-41-portfolio-dashboard` | **Date**: 2026-06-22 | **Spec**: `spec.md`

## Summary

Single-page React + TypeScript portfolio dashboard. All state lives in `App` (holdings array + sort key/dir). Computed values (market value, cost basis, gain/loss) are derived on each render from the holdings array — no separate derived state. The allocation chart is a pure SVG rendered from the same holdings array. No external libraries beyond the approved stack.

## Technical Context

**Language/Version**: TypeScript 5.6 / React 18

**Primary Dependencies**: React, React DOM (runtime); Vite (build); Vitest + Testing Library (tests)

**Storage**: N/A — in-memory React state only

**Testing**: Vitest + @testing-library/react; coverage ≥ 80% lines/branches/functions/statements

**Target Platform**: Browser (Vite SPA)

**Project Type**: Web application (SPA)

**Performance Goals**: Instant re-render on every edit (< 50 holdings, simple arithmetic)

**Constraints**: No external libraries; inline SVG chart only; `npm run ci` must pass

**Scale/Scope**: MVP — up to ~50 holdings, single user, no persistence

## Constitution Check

- ✅ Scope: all changes inside `workspaces/issue-41-portfolio-dashboard/`
- ✅ Security: no secrets, no eval, no SQL, no external boundaries
- ✅ Stack: React + TypeScript + Vite + Vitest only; no banned packages
- ✅ Tests: TDD — tests written first, coverage ≥ 80%
- ✅ No direct merge to main — PR only

## Project Structure

```text
workspaces/issue-41-portfolio-dashboard/
├── spec.md
├── plan.md
├── tasks.md
└── src/
    ├── types.ts              # Holding interface, SortKey/SortDir types
    ├── data.ts               # INITIAL_HOLDINGS constant
    ├── utils.ts              # Pure calc + format functions
    ├── App.tsx               # Root — owns holdings/sort state, mounts components
    ├── App.test.tsx          # Integration tests covering all acceptance criteria
    └── components/
        ├── PortfolioTable.tsx   # Table with editable price, sortable headers, totals
        ├── AllocationChart.tsx  # Inline SVG horizontal bar chart
        └── AddHoldingForm.tsx   # Controlled form for adding a new holding
```

**Structure Decision**: Single Vite SPA project (workspace already scaffolded). Components directory for the three named sub-components; all tests in `App.test.tsx` testing through the full component tree.

## Data Flow

```
App (state: holdings[], sortKey, sortDir)
 ├─ derives: sortedHoldings = [...holdings].sort(...)
 ├─ AddHoldingForm  ─onAdd──────────────────► setHoldings([...prev, newHolding])
 ├─ PortfolioTable  ─onSort──────────────────► setSortKey/setSortDir
 │   (receives sortedHoldings)  ─onRemove─►  setHoldings(prev.filter(...))
 │                               ─onPriceChange► setHoldings(prev.map(...))
 └─ AllocationChart (receives holdings, not sortedHoldings — chart order is stable)
```

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Compute everything on render | No holding has expensive computation; avoids derived-state bugs |
| `sortedHoldings` spread-copy | Prevents mutating React state in `Array.sort` |
| AllocationChart gets `holdings` (unsorted) | Chart bar order stays stable regardless of table sort |
| Unique `id` via `useRef` counter starting at 100 | Avoids collision with initial holdings IDs 1-5 |
| `aria-label` on price inputs & Remove buttons | Enables precise test queries without data-testid clutter |
