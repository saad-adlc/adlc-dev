# Tasks: Unit Converter (Length)

**Input**: spec.md + plan.md

## Phase 1: Spec / Plan / Tasks

- [x] T001 Write spec.md
- [x] T002 Write plan.md
- [x] T003 Write tasks.md (this file)

---

## Phase 2: TDD — Tests First (must FAIL before implementation)

**Goal**: Write failing tests for every acceptance criterion in spec.md.

- [x] T004 [P] Write conversion unit tests for all six unit pairs + same-unit case in `src/unit-converter.test.tsx`
- [x] T005 [P] Write component integration tests: initial render (3.2808), empty input hint, invalid/negative input (no NaN), live update on change in `src/unit-converter.test.tsx`

**Checkpoint**: `npm test` is RED (tests exist but implementation is a stub).

---

## Phase 3: Implementation

**Goal**: Make all tests green with minimal code.

- [x] T006 Implement `convert(value, from, to)` + `Unit` type + `UNIT_LABELS` in `src/unit-converter.tsx`
- [x] T007 Implement `UnitSelect` helper component in `src/unit-converter.tsx`
- [x] T008 Implement `UnitConverter` default export component in `src/unit-converter.tsx`
- [x] T009 Add CSS Modules styles to `src/unit-converter.module.css`
- [x] T010 Mount `<UnitConverter />` in `src/App.tsx`

**Checkpoint**: `npm test` is GREEN; all acceptance criteria pass.

---

## Phase 4: CI Gate

- [x] T011 Run `npm run ci` (typecheck + lint + tests + coverage ≥ 80%); fix any failures

---

## Dependencies & Execution Order

- T001–T003: no deps, can start immediately
- T004–T005: no deps (write tests against not-yet-existing exports; they fail)
- T006–T010: implement after tests are written
- T011: after all implementation tasks complete
