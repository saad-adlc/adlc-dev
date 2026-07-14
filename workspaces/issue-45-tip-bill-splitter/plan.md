# Implementation Plan: Tip & Bill Splitter

**Branch**: `feature/issue-45-tip-bill-splitter` | **Date**: 2026-06-23 | **Spec**: `spec.md`

## Summary

Build a single-page React+TypeScript tip and bill splitter. User inputs bill amount, selects a preset tip % (15/18/20) or types a custom %, and enters number of people. Tip amount, grand total, and per-person amount update live. Pre-filled with $84.50 / 18 % / 3 people. Edge cases: empty/negative bill → $0; people ≤ 0 or empty → show "—".

## Technical Context

**Language/Version**: TypeScript 5.6 + React 18
**Primary Dependencies**: react, react-dom (already installed)
**Storage**: N/A — ephemeral React state
**Testing**: Vitest 2 + @testing-library/react 16
**Target Platform**: Browser (Vite SPA)
**Project Type**: Web application (SPA, single component)
**Performance Goals**: Instantaneous (synchronous derived values)
**Constraints**: No new dependencies; line/branch/function coverage ≥ 80 %
**Scale/Scope**: Single component + extracted pure calculation utility

## Constitution Check

- No secrets, no `eval`, no SQL — satisfied.
- No new npm dependencies — satisfied (approved stack only).
- Work stays inside `workspaces/issue-45-tip-bill-splitter/` — satisfied.
- TDD (tests first, then implementation) — required by constitution.

## Project Structure

```text
workspaces/issue-45-tip-bill-splitter/
├── spec.md                         # This feature's specification
├── plan.md                         # This file
├── tasks.md                        # Task checklist
└── src/
    ├── calculationUtils.ts          # Pure tip calculation function
    ├── calculationUtils.test.ts     # Unit tests for calculation logic
    ├── TipSplitter.tsx              # Main feature component
    ├── TipSplitter.test.tsx         # Component integration tests
    ├── App.tsx                      # Root — mounts TipSplitter
    ├── App.test.tsx                 # Smoke test for App
    ├── main.tsx                     # Entry point (excluded from coverage)
    └── test-setup.ts                # jest-dom setup (unchanged)
```

**Structure Decision**: Single project, flat `src/`. Calculation logic extracted to `calculationUtils.ts` for pure-function unit testing; the React component tests focus on UI interactions and acceptance criteria.

## Complexity Tracking

No constitution violations; no extra complexity required.
