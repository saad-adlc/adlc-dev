# Implementation Plan: Live World Population Dashboard

**Branch**: `feature/issue-43-live-world-population-dashboard` | **Date**: 2026-06-22 | **Spec**: `spec.md`

## Summary

Build a single-screen React dashboard that displays live-ticking population counters for the world and six continents, computed entirely in the browser from baked-in reference data anchored to 2026-06-22T00:00:00Z. No network calls; state is a single `nowMs` timestamp updated by `setInterval` every second.

## Technical Context

**Language/Version**: TypeScript 5.6 / React 18.3

**Primary Dependencies**: React 18 + Vite 5 (scaffolded); no additional runtime dependencies.

**Storage**: N/A — all reference data is module-level constants compiled into the bundle.

**Testing**: Vitest 2 + Testing Library + jsdom; coverage ≥ 80% lines via `@vitest/coverage-v8`.

**Target Platform**: Browser (Vite SPA).

**Performance Goals**: Counter refresh ≤ 1 second; no layout reflow on each tick (`tabular-nums`).

**Constraints**: No `moment`; no full `lodash`; no runtime API calls; no banned packages.

**Scale/Scope**: Single component tree; ~6 source files.

## Constitution Check

- No secrets or hardcoded credentials. ✓
- No `eval()`. ✓
- No banned packages. ✓
- Scope: entirely within `workspaces/issue-43-live-world-population-dashboard/`. ✓
- Tests written first; coverage target ≥ 80%. ✓

## Project Structure

```text
workspaces/issue-43-live-world-population-dashboard/
├── spec.md
├── plan.md
├── tasks.md
└── src/
    ├── data/
    │   └── continents.ts          # baked-in reference data + BASELINE_MS constant
    ├── utils/
    │   ├── population.ts          # pure functions: computePopulation, formatNumber, etc.
    │   └── population.test.ts     # unit tests for calculation logic
    ├── components/
    │   ├── WorldTotal.tsx         # world headline counter + subtitle
    │   ├── ContinentCard.tsx      # single continent card with badges
    │   ├── Dashboard.tsx          # orchestrator: setInterval, derives all values
    │   └── Dashboard.test.tsx     # render + timer tests
    ├── index.css                  # global styles (tabular-nums, grid layout)
    ├── App.tsx                    # root: mounts Dashboard
    ├── main.tsx                   # Vite entry (untouched)
    └── test-setup.ts              # jest-dom matchers (untouched)
```

**Structure Decision**: Single-project Vite SPA. All logic lives in `src/`; no backend.

## Key Design Decisions

1. **Single source of truth for time**: Dashboard holds one `nowMs` state. All population values are derived from it synchronously — no per-continent state. This guarantees the world total = sum invariant.

2. **Pure computation functions**: `computePopulation(baseline, ratePct, elapsedSecs)` is a pure function, making it trivially testable without mocking React.

3. **World total = sum(continents)**: The world total is computed as `continents.reduce(sum)` in the render path, never independently — this enforces FR-004 by construction.

4. **No extra packages**: `Intl.NumberFormat` for thousands separators (approved); no `date-fns`, no `moment`.
