# Implementation Plan: Canadian Take-Home Salary Calculator

**Branch**: `feature/issue-59-canadian-take-home-salary-calculator` | **Date**: 2026-06-25 | **Spec**: spec.md

## Summary

Build a single-page React + TypeScript take-home salary calculator for Ontario/2024.
Pure client-side math — no API calls, no new dependencies. TDD: unit tests first,
then minimal components mounted in App.tsx.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode)

**Primary Dependencies**: React 18, Vite 5, Vitest 2 — all already in the scaffold; none added.

**Storage**: N/A — ephemeral React state only.

**Testing**: Vitest + @testing-library/react; coverage ≥ 80% lines enforced by vite.config.ts thresholds.

**Target Platform**: Browser SPA (single page).

**Project Type**: Frontend-only web application.

**Performance Goals**: O(1) calculation — recalculates on every keystroke without delay.

**Constraints**: ≤300 code lines/file, ≤40 lines/function, kebab-case filenames, JSDoc on exports, CSS Modules (no inline styles).

**Scale/Scope**: Single user, single page, ~10 source files.

## Constitution Check

- ✅ No secrets, tokens, or hardcoded credentials.
- ✅ Approved stack only (React+TS+Vite+Vitest).
- ✅ No new runtime packages (`dependencies` block unchanged).
- ✅ TDD — tests written first, verified failing before implementation.
- ✅ Coverage ≥ 80% lines enforced by threshold config.
- ✅ All writes confined to `workspaces/issue-59-canadian-take-home-salary-calculator/`.
- ✅ No `eval()`, no SQL, no external boundaries requiring validation beyond user input.

## Project Structure

```text
workspaces/issue-59-canadian-take-home-salary-calculator/src/
├── lib/
│   ├── tax-calculator.ts          # Pure 2024 tax math + exported types
│   ├── tax-calculator.test.ts     # Unit tests: brackets, CPP, EI, conversions
│   └── format.ts                  # Currency formatting utility
├── components/
│   ├── salary-input.tsx           # Toggle (Hourly/Yearly) + primary input + equivalent display
│   ├── salary-input.module.css
│   ├── results-cards.tsx          # 3-column take-home cards (hourly / monthly / yearly)
│   ├── results-cards.module.css
│   ├── tax-breakdown-table.tsx    # Breakdown table + effective-rate footer
│   ├── tax-breakdown-table.module.css
│   ├── salary-calculator.tsx      # Container: state + validation + composition
│   ├── salary-calculator.module.css
│   └── salary-calculator.test.tsx # Integration tests for full UI
├── App.tsx                        # Mounts SalaryCalculator
├── App.module.css
├── main.tsx                       # Scaffold — untouched
└── test-setup.ts                  # Scaffold — untouched
```

**Structure Decision**: Single-project frontend. All tax logic is in `lib/tax-calculator.ts`
(pure functions, no React). Presentational components are thin and prop-driven. The container
`salary-calculator.tsx` owns state and passes computed props down. This keeps the pure logic
independently testable from the UI.

## Complexity Tracking

No constitution violations. No extra abstraction layers needed for this MVP scope.
