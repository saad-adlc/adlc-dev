# Tasks: Hello Greeting

**Input**: spec.md, plan.md

## Phase 1: Tests (TDD — write first, must fail before implementation)

- [x] T001 [US1,US2,US3] Write Greeter.test.tsx covering all acceptance criteria in src/Greeter.test.tsx

## Phase 2: Implementation

- [x] T002 [US1] Create Greeter component with name input and Greet button in src/Greeter.tsx
- [x] T003 [US1] Wire Enter-key submission (onKeyDown) in Greeter.tsx
- [x] T004 [US2] Return "Hello, World!" when trimmed input is empty in Greeter.tsx
- [x] T005 [US3] Trim leading/trailing whitespace before constructing greeting in Greeter.tsx
- [x] T006 Mount Greeter in App.tsx

## Phase 3: CI

- [x] T007 Run `npm run ci` and fix until green

## Dependencies

- T001 must be written (and red) before T002–T006
- T002–T006 can proceed in any order once T001 exists
- T007 last
