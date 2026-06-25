# Implementation Plan: Unit Converter (Length)

**Branch**: `feature/issue-54-unit-converter` | **Date**: 2026-06-25 | **Spec**: spec.md

## Summary

Build a self-contained React component that converts length values between metres, feet, and inches. Conversion is done with pure arithmetic (no external API); the result updates live via React state. Default load: input=1, from=Meters, to=Feet → result "3.2808".

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: React 18, Vitest 2, @testing-library/react (all pre-installed in the workspace)

**Storage**: None — all state is ephemeral React state

**Testing**: Vitest + @testing-library/react, coverage ≥ 80% lines via `@vitest/coverage-v8`

**Target Platform**: Browser (Vite SPA)

**Project Type**: Single-page React widget

**Performance Goals**: Instant (synchronous arithmetic)

**Constraints**: No new npm packages; ≤ 300 non-blank lines per file; ≤ 40 lines per function

## Constitution Check

- No secrets, keys, or tokens → satisfied (pure arithmetic).
- No eval → satisfied.
- Approved stack only (React + TS + Vite + Vitest) → satisfied.
- Work stays inside `workspaces/issue-54-unit-converter/` → satisfied.
- TDD: tests written before implementation passes → plan below enforces this.

## Project Structure

```text
workspaces/issue-54-unit-converter/
├── spec.md                         # this spec
├── plan.md                         # this plan
├── tasks.md                        # task list
└── src/
    ├── unit-converter.tsx          # conversion logic + React component (exported together)
    ├── unit-converter.test.tsx     # Vitest + Testing Library tests
    ├── unit-converter.module.css   # CSS Modules styles (no inline styles)
    └── App.tsx                     # mounts <UnitConverter />
```

**Structure Decision**: Single project at workspace root. All feature code lives in `src/`; no subdirectories needed for an MVP this small.

## Design Decisions

1. **Single source file for logic + component** (`unit-converter.tsx`): the conversion function is only 3 lines; splitting to a separate `.ts` file adds ceremony without benefit.
2. **Named `convert` export + default component export**: the test file imports both from a single import statement.
3. **CSS Modules** (`unit-converter.module.css`): satisfies the "no inline styles" rule while keeping styles co-located.
4. **`UnitSelect` helper component** extracted from `UnitConverter` to keep the main component function under 40 lines.
