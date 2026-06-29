# Implementation Plan: Hello World v2

**Branch**: `feature/issue-65-hello-world-v2` | **Date**: 2026-06-26 | **Spec**: spec.md

## Summary

Build a self-contained React greeting widget: name input + style dropdown drive a live greeting line; a Shout checkbox uppercases it; a Greet button increments a counter. Pure local state — no API, no routing.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: React 18, Vite 5, Vitest 2, @testing-library/react

**Storage**: N/A (all in-memory React state)

**Testing**: Vitest + @testing-library/react, coverage ≥ 80%

**Target Platform**: Browser (Vite dev/build)

**Project Type**: Single React SPA workspace

**Performance Goals**: Instant re-render on every keystroke (React controlled input)

**Constraints**: No new npm packages; approved stack only; no inline styles (CSS Modules)

## Constitution Check

- No secrets, no eval, no SQL — ✅
- Approved stack only (React+TS+Vite+Vitest) — ✅
- Tests written first (TDD); coverage ≥ 80% — ✅
- PR only, no direct merge — ✅

## Project Structure

```text
workspaces/issue-65-hello-world-v2/
├── spec.md
├── plan.md
├── tasks.md
└── src/
    ├── App.tsx                              ← mounts HelloWorld
    ├── main.tsx                             ← unchanged
    ├── test-setup.ts                        ← unchanged
    └── hello-world/
        ├── greeting.ts                      ← pure greeting composer logic
        ├── greeting.test.ts                 ← unit tests for composer
        ├── hello-world.tsx                  ← stateful component
        ├── hello-world.test.tsx             ← component integration tests
        └── hello-world.module.css           ← CSS Modules (no inline styles)
```

**Structure Decision**: Single React workspace; feature code isolated in `src/hello-world/`. Pure logic extracted to `greeting.ts` so it can be tested without DOM.
