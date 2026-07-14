# Tasks: Balance Sheet

**Input**: spec.md + plan.md

## Phase 1: Types & Utilities (Shared Foundation)

- [x] T001 Create `src/balance-types.ts` — `LineItem` interface and `SectionId` type
- [x] T002 Create `src/balance-utils.test.ts` — unit tests for all pure functions (TDD: write
      first, verify they fail before implementation)
- [x] T003 Create `src/balance-utils.ts` — `parseAmount`, `isInvalidAmount`, `computeTotal`,
      `isBalanced`, `formatMoney`

---

## Phase 2: User Story 1 — View and Edit Sections (P1)

**Goal**: Three editable sections with subtotals and add/remove controls.

**Independent Test**: Load app, see prefilled data, edit an amount, verify subtotal updates.

### Tests (TDD)

- [x] T004 Add to `src/balance-sheet.test.tsx` — renders three sections with prefilled data
- [x] T005 Add to `src/balance-sheet.test.tsx` — add line, remove line, edit amount updates subtotal

### Implementation

- [x] T006 Create `src/balance-section.tsx` — `LineItemRow` + `BalanceSection` components
- [x] T007 Create `src/balance-section.module.css` — section, item row, add/remove buttons
- [x] T008 Create `src/balance-sheet.tsx` — root component with `SectionsState`, `INITIAL_STATE`,
      and four state-update helpers (`addItem`, `removeItem`, `updateItem`)
- [x] T009 Create `src/balance-sheet.module.css` — sheet layout, summary, balance status styles

**Checkpoint**: App renders with sample data; add/remove/edit all work.

---

## Phase 3: User Story 2 — Balance Status (P2)

**Goal**: Show "In balance" or the exact difference with which side is heavier.

**Independent Test**: Change an amount; verify status message updates correctly.

### Tests (TDD)

- [x] T010 Add to `src/balance-sheet.test.tsx` — shows "In balance" on load
- [x] T011 Add to `src/balance-sheet.test.tsx` — shows out-of-balance message (assets exceed
      claims and claims exceed assets cases)

### Implementation

- [x] T012 Add `renderBalanceStatus` helper in `balance-sheet.tsx` — returns "In balance" p or
      out-of-balance p with formatted difference

**Checkpoint**: Balance status correct for all mutations.

---

## Phase 4: User Story 3 — Input Validation (P3)

**Goal**: Blank = 0; non-numeric = flagged + excluded; negatives work.

**Independent Test**: Enter "abc", verify flag shown and total unchanged.

### Tests (TDD)

- [x] T013 Add to `src/balance-sheet.test.tsx` — non-numeric flagged, excluded from total
- [x] T014 Add to `src/balance-sheet.test.tsx` — blank treated as 0, no flag shown
- [x] T015 Add to `src/balance-sheet.test.tsx` — negative amount accepted

### Implementation

- [x] T016 `balance-section.tsx` already handles via `isInvalidAmount` and conditional alert span
      (covered by existing implementation in Phase 2)

**Checkpoint**: Validation complete.

---

## Phase 5: User Story 4 — Balance Visual (P4)

**Goal**: Inline SVG two-bar chart comparing the two sides.

**Independent Test**: Load app; SVG with both labelled bars is visible.

### Tests (TDD)

- [x] T017 Add to `src/balance-sheet.test.tsx` — SVG visual renders with accessible role

### Implementation

- [x] T018 Create `src/balance-visual.tsx` — two-bar SVG with `computeBarWidth` helper
- [x] T019 Create `src/balance-visual.module.css` — container, bar fill colours

**Checkpoint**: Visual renders and updates with the data.

---

## Phase 6: Wiring & CI

- [x] T020 Update `src/App.tsx` — mount `<BalanceSheet />`
- [x] T021 Run `npm run ci` — fix all typecheck, lint, and coverage failures until green

---

## Dependencies & Execution Order

- T001 → T002 → T003 (types before tests before utils)
- T002/T004/T005 written before T006–T019 (TDD)
- T008 depends on T006 (section component must exist to import)
- T018 depends on T003 (uses formatMoney from utils)
- T020 depends on T008 (BalanceSheet must exist)
- T021 last (validates everything)
