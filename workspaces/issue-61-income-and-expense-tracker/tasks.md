---
description: "Task list for Income & Expense Tracker"
---

# Tasks: Income & Expense Tracker

**Input**: spec.md + plan.md

## Phase 1: Foundation

- [x] T001 Write spec.md, plan.md, tasks.md
- [x] T002 [P] Create src/types.ts — Transaction interface + AllBudgets type
- [x] T003 [P] Create src/constants.ts — DEFAULT_CATEGORIES, storage keys, threshold constants
- [x] T004 [P] Create src/storage.ts — loadTransactions, saveTransactions, loadBudgets, saveBudgets
- [x] T005 [P] Create src/utils.ts — monthKey, filterByMonth, totalIncome, totalExpenses, spentByCategory, progressColor, formatCurrency, monthLabel
- [x] T006 Create src/use-tracker-store.ts — useTrackerStore custom hook

---

## Phase 2: Tests (TDD — written before implementation is verified by CI)

- [x] T007 [P] Write src/storage.test.ts — localStorage round-trip, empty state, malformed data
- [x] T008 [P] Write src/utils.test.ts — all utility functions, edge cases
- [x] T009 [P] Write src/components/header-bar.test.tsx
- [x] T010 [P] Write src/components/summary-cards.test.tsx
- [x] T011 [P] Write src/components/budget-section.test.tsx
- [x] T012 [P] Write src/components/add-transaction-form.test.tsx
- [x] T013 [P] Write src/components/transaction-list.test.tsx
- [x] T014 Write src/App.test.tsx — integration tests

---

## Phase 3: Components

- [x] T015 [P] Create src/components/header-bar.tsx + header-bar.module.css [US5]
- [x] T016 [P] Create src/components/summary-cards.tsx + summary-cards.module.css [US3]
- [x] T017 Create src/components/budget-section.tsx + budget-section.module.css [US4]
- [x] T018 Create src/components/add-transaction-form.tsx + add-transaction-form.module.css [US1]
- [x] T019 Create src/components/transaction-list.tsx + transaction-list.module.css [US2]
- [x] T020 Update src/App.tsx — compose all components with useTrackerStore
- [x] T021 Create src/App.module.css — root layout

---

## Phase 4: CI Gate

- [x] T022 Run npm run ci — fix until green (typecheck + lint + tests + coverage ≥ 80%)

---

## Dependencies

- T002–T006 can run in parallel (different files)
- T007–T014 can run in parallel; written before components are fully verified
- T015–T021 can run in parallel; each owns its own files
- T022 requires T001–T021 complete
