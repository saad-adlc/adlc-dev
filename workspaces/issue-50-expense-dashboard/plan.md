# Implementation Plan: Expense Dashboard

**Branch**: `feature/issue-50-expense-dashboard` | **Date**: 2026-06-25 | **Spec**: `spec.md`

## Summary

Build a read-only, two-view React + TypeScript SPA with client-side routing. The
Overview view shows aggregate totals and an inline-SVG bar chart; the Transactions view
shows a filterable expense table. Data is static and prefilled at build time.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + React 18.x

**Primary Dependencies**: `react-router-dom` ^6.x (routing), `react` + `react-dom`

**Storage**: N/A — static in-memory data

**Testing**: Vitest + @testing-library/react; coverage ≥ 80% lines

**Target Platform**: Browser (Vite + jsdom for tests)

**Project Type**: Single-page web application (SPA)

**Performance Goals**: No specific perf target — static data, no network calls

**Constraints**: No chart library; chart must be inline SVG. No inline styles (CSS
Modules only). Files ≤ 300 lines. Functions ≤ 40 lines.

**Scale/Scope**: 8 static transactions, 4 categories, 2 routes.

## Constitution Check

- ✅ No secrets or hardcoded tokens.
- ✅ Only approved packages (`react-router-dom` is on the allow-list).
- ✅ No `eval`, no string-concatenated SQL.
- ✅ Work confined to `workspaces/issue-50-expense-dashboard/`.
- ✅ Tests written first (TDD), coverage gate ≥ 80%.

## Project Structure

```text
workspaces/issue-50-expense-dashboard/
├── spec.md
├── plan.md
├── tasks.md
└── src/
    ├── expenses.ts                 # static data + utility functions
    ├── expenses.test.ts            # unit tests for utility functions
    ├── nav-bar.tsx                 # top nav with NavLink
    ├── nav-bar.module.css
    ├── nav-bar.test.tsx
    ├── spend-bar-chart.tsx         # inline SVG bar chart
    ├── spend-bar-chart.module.css
    ├── spend-bar-chart.test.tsx
    ├── overview-page.tsx           # /overview route content
    ├── overview-page.module.css
    ├── overview-page.test.tsx
    ├── transactions-page.tsx       # /transactions route content
    ├── transactions-page.module.css
    ├── transactions-page.test.tsx
    ├── App.tsx                     # BrowserRouter + routes
    ├── App.module.css
    ├── App.test.tsx
    ├── main.tsx                    # Vite entry (excluded from coverage)
    └── test-setup.ts               # jest-dom import
```

**Structure Decision**: Single flat `src/` layout — 8 static records do not warrant
nested feature folders.

## Complexity Tracking

No constitution violations. `react-router-dom` is on the approved allow-list; the chart
is hand-rolled SVG as instructed.
