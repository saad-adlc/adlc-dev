# Tasks: Expense Dashboard

**Input**: `spec.md`, `plan.md`

## Phase 1: Foundation

- [x] T001 Write spec.md, plan.md, tasks.md
- [x] T002 Install `react-router-dom` (approved package)

---

## Phase 2: Data Layer

- [x] T003 [P] Write `src/expenses.test.ts` (failing) — tests for `categoryTotals` and `grandTotal`
- [x] T004 [P] Write `src/expenses.ts` — `Expense` interface, `EXPENSES`, `CATEGORIES`, `categoryTotals`, `grandTotal`

**Checkpoint**: Data utilities pass.

---

## Phase 3: User Story 1 — Overview (P1)

**Goal**: Overview page shows $604.84 total, 8 transactions, SVG bar chart.

### Tests (write first, must fail before implementation)

- [x] T005 [P] Write `src/spend-bar-chart.test.tsx` — verify SVG renders, Bills bar tallest
- [x] T006 [P] Write `src/overview-page.test.tsx` — verify total $604.84, count 8, chart present

### Implementation

- [x] T007 Write `src/spend-bar-chart.tsx` + `src/spend-bar-chart.module.css`
- [x] T008 Write `src/overview-page.tsx` + `src/overview-page.module.css`

**Checkpoint**: Overview tests pass independently.

---

## Phase 4: User Story 2 — Transactions (P2)

**Goal**: Transactions page shows 8-row table with working category filter.

### Tests (write first, must fail before implementation)

- [x] T009 Write `src/transactions-page.test.tsx` — 8 rows default, Food filter = 2 rows, All restores 8

### Implementation

- [x] T010 Write `src/transactions-page.tsx` + `src/transactions-page.module.css`

**Checkpoint**: Transactions tests pass independently.

---

## Phase 5: User Story 3 — Routing (P3)

**Goal**: Two distinct URLs; root redirects to /overview; nav links highlight active route.

### Tests (write first, must fail before implementation)

- [x] T011 [P] Write `src/nav-bar.test.tsx` — links render, active class applied
- [x] T012 [P] Write `src/App.test.tsx` — routing from /, /overview, /transactions

### Implementation

- [x] T013 Write `src/nav-bar.tsx` + `src/nav-bar.module.css`
- [x] T014 Write `src/App.tsx` + `src/App.module.css`

**Checkpoint**: Full routing tests pass.

---

## Phase 6: CI Gate

- [x] T015 Run `npm run ci`; fix any type/lint/coverage failures until green
- [x] T016 Commit: `git add workspaces/issue-50-expense-dashboard && git commit`
