# Spec: Hello Greeter

**Issue:** #24
**Date:** 2026-06-17
**Stack:** React 18 / TypeScript (Vite workspace)

## What we're building

A single-page app where the user types a name, clicks Add (or presses Enter), and sees a
running list of greetings formatted as "Hello, [name]!". The list is persisted to
`localStorage` so it survives page reloads.

## Acceptance criteria

1. Typing a name and clicking Add (or pressing Enter) appends "Hello, [name]!".
2. The input clears after each successful add.
3. Empty / whitespace-only input is rejected; the Add button is disabled in that state.
4. Each row has a ✕ remove button that deletes only that row.
5. A "Clear all" button empties the entire list.
6. The list survives a page reload in the same order.
7. When the list is empty, an empty-state message is shown instead of a blank box.

## File plan

| File | Purpose |
|---|---|
| `src/greeting-utils.ts` | `formatGreeting`, `isValidName` pure helpers |
| `src/use-greetings.ts` | `useGreetings` hook — state + localStorage |
| `src/hello-greeter.tsx` | Main component |
| `src/hello-greeter.module.css` | CSS Module styles |
| `src/greeting-utils.test.ts` | Unit tests for pure helpers |
| `src/hello-greeter.test.tsx` | Hook + component integration tests |

## Assumptions

- Greeting format: exactly `Hello, [name]!` (capital H, trailing !).
- Leading/trailing whitespace is trimmed before greeting is stored.
- Duplicate names are allowed.
- No routing, no backend, no authentication.

## Out of scope

Editing in place, bulk import, reordering, sort/search, backend, export.

## Definition of done

- `npm run ci` passes (typecheck + lint + test:coverage all green).
- Coverage ≥ 80% lines/functions/branches/statements.
- PR opened to `adlc-stage` with description filled.
