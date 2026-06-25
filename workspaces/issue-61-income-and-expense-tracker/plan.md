# Implementation Plan: Income & Expense Tracker

**Branch**: `feature/issue-61-income-and-expense-tracker` | **Date**: 2026-06-25 | **Spec**: [spec.md](spec.md)

## Summary

Build a single-page personal finance app in React + TypeScript. Users log income/expense
transactions by category, set monthly category budgets, and view summary cards and budget
progress bars. All data persists to localStorage with no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: React 18, Vite 5 — no new packages required

**Storage**: Browser localStorage (synchronous read/write helpers)

**Testing**: Vitest 2 + @testing-library/react + @testing-library/jest-dom, coverage ≥ 80% lines

**Target Platform**: Browser (modern)

**Project Type**: React single-page app

**Performance Goals**: Instant UI updates on all user interactions

**Constraints**: No new npm packages; no inline styles (CSS Modules only); max 300 lines/file, 40 lines/function

**Scale/Scope**: Single-user, browser-only

## Constitution Check

- No secrets or external integrations — ✅
- No banned packages — ✅ (no new packages installed)
- No direct merge to main — ✅ (PR only)
- TDD: tests written before implementation — ✅
- Scope confined to `workspaces/issue-61-income-and-expense-tracker/` — ✅

## Project Structure

```text
src/
├── types.ts                        # Transaction + AllBudgets TypeScript interfaces
├── constants.ts                    # DEFAULT_CATEGORIES, storage keys, threshold constants
├── storage.ts                      # localStorage read/write helpers
├── utils.ts                        # Pure calculation & formatting functions
├── use-tracker-store.ts            # Custom hook — state + persistence
├── App.tsx                         # Root component — composes all sections
├── App.module.css                  # Root layout styles
├── storage.test.ts
├── utils.test.ts
├── App.test.tsx
└── components/
    ├── header-bar.tsx              # Title + month navigator
    ├── header-bar.module.css
    ├── header-bar.test.tsx
    ├── summary-cards.tsx           # Income / Expenses / Balance cards
    ├── summary-cards.module.css
    ├── summary-cards.test.tsx
    ├── budget-section.tsx          # Per-category budget rows with progress bars
    ├── budget-section.module.css
    ├── budget-section.test.tsx
    ├── add-transaction-form.tsx    # Form to add a transaction
    ├── add-transaction-form.module.css
    ├── add-transaction-form.test.tsx
    ├── transaction-list.tsx        # List of transactions with delete
    ├── transaction-list.module.css
    └── transaction-list.test.tsx
```

**Structure Decision**: Single React app in the scaffolded workspace, component-per-feature.

## Data Flow

1. `useTrackerStore` hook owns all state (transactions, budgets, currentYear, currentMonth).
2. State is initialised from localStorage on mount; every mutation persists back immediately.
3. App computes derived values (filtered transactions, totals, spent-per-category) before
   passing them as props to display components.
4. Display components are pure — they receive data and callback props only.

## Key Design Decisions

- **No Zustand / React Query**: state is simple enough for `useState` + `useCallback`.
- **CSS Modules**: every component has a co-located `.module.css` file; no inline styles
  except `style={{ '--fill': '...' }}` for the dynamic progress-bar width via CSS custom
  properties (the only acceptable inline-style exception).
- **Progress bar colour**: green when spent < 85% of budget, amber 85–99%, red ≥ 100%.
  Thresholds are named constants in `constants.ts`.

## Complexity Tracking

No constitution violations.
