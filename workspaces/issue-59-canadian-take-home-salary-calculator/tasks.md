# Tasks: Canadian Take-Home Salary Calculator

**Input**: spec.md + plan.md

## Phase 1: Core Logic (Shared — blocks all UI work)

- [x] T001 [P] Write `src/lib/tax-calculator.ts` — 2024 federal/Ontario brackets, CPP, EI, TakeHomeResult
- [x] T002 [P] Write `src/lib/format.ts` — formatCurrency utility (en-CA, CAD)
- [x] T003 Write `src/lib/tax-calculator.test.ts` — unit tests for all exported functions (TDD: written first)

**Checkpoint**: `npm test` runs and all unit tests pass for the pure logic layer.

---

## Phase 2: User Story 1 — Salary Input + Result Cards (Priority: P1) 🎯 MVP

**Goal**: User enters salary (hourly or yearly), sees three take-home cards and effective rate.

### Tests — US1

- [x] T004 Write `src/components/salary-calculator.test.tsx` — integration tests (renders, toggle, results cards, empty state)

### Implementation — US1

- [x] T005 [P] Write `src/components/salary-input.tsx` + `salary-input.module.css` — toggle + labeled input + equivalent display
- [x] T006 [P] Write `src/components/results-cards.tsx` + `results-cards.module.css` — 3-column hourly/monthly/yearly cards
- [x] T007 Write `src/components/salary-calculator.tsx` + `salary-calculator.module.css` — container state + validation + composition
- [x] T008 Update `src/App.tsx` + `src/App.module.css` — mount SalaryCalculator

**Checkpoint**: User Story 1 independently functional — enter $60,000, see three take-home cards.

---

## Phase 3: User Story 2 — Tax Breakdown Table (Priority: P2)

**Goal**: Table shows each tax bracket, CPP, EI, and effective rate footer.

### Implementation — US2

- [x] T009 [P] Write `src/components/tax-breakdown-table.tsx` + `tax-breakdown-table.module.css` — Type/Bracket/Rate/Amount table with tfoot

**Checkpoint**: Breakdown table visible with correct rows and footer when salary is entered.

---

## Phase 4: User Story 3 — Input Validation (Priority: P3)

**Goal**: Empty, negative, $0, and unreasonably large values handled gracefully.

*(Validation is already built into the salary-calculator container — covered by T004 integration tests.)*

**Checkpoint**: Error on negative, warning on >$10M, $0 shows zero results, empty shows no results.

---

## Phase 5: CI Gate

- [x] T010 Run `npm run ci` (typecheck + lint + test:coverage) and fix until green.

---

## Dependencies & Execution Order

- T001, T002 can run in parallel (different files).
- T003 depends on T001 (imports from tax-calculator).
- T004 depends on T007 (imports SalaryCalculator component).
- T005, T006, T009 can run in parallel (different component files).
- T007 depends on T005, T006, T009 (imports them).
- T008 depends on T007.
- T010 runs last (verifies everything).
