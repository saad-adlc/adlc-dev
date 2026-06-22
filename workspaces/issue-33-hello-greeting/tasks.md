# Tasks: Hello Greeting

**Input**: spec.md + plan.md

## Phase 1: Tests (TDD — write first, must FAIL before implementation)

- [x] T001 [US1] Write failing tests for Greeter component in `src/Greeter.test.tsx`:
  - renders a labelled name input and a Greet button
  - typing a name and clicking Greet shows "Hello, Ada!"
  - pressing Enter in the input shows the same greeting as clicking Greet
- [x] T002 [US2] Extend test file with:
  - clicking Greet with an empty input shows "Hello, World!"
  - typing only spaces and clicking Greet shows "Hello, World!"
- [x] T003 [US1] Extend test file with:
  - typing "  Ada  " (whitespace-padded) and clicking Greet shows "Hello, Ada!"

## Phase 2: Implementation

- [x] T004 [US1][US2] Create `src/Greeter.tsx` — controlled input + button + greeting display
  - useState for inputValue and greeting
  - greet() helper: trims input, falls back to "World", sets greeting
  - onKeyDown handler: calls greet() on Enter key
- [x] T005 [US1] Mount `<Greeter />` in `src/App.tsx`

## Phase 3: CI Green

- [x] T006 Run `npm run ci` (typecheck + lint + test:coverage) — fix until green

## Traceability

| Acceptance Criterion | Task | Test |
|---|---|---|
| SC-001 "Ada" → "Hello, Ada!" | T001, T004 | renders greeting for name |
| SC-002 empty → "Hello, World!" | T002, T004 | renders default greeting when empty |
| SC-003 "  Ada  " → "Hello, Ada!" | T003, T004 | trims whitespace |
| SC-004 Enter key greets | T001, T004 | Enter key triggers greeting |
| SC-005 coverage >= 80% | T006 | enforced by vitest coverage thresholds |
