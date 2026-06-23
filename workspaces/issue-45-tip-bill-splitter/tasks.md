# Tasks: Tip & Bill Splitter

**Input**: `spec.md`, `plan.md`

## Phase 1: Setup

- [x] T001 Confirm workspace scaffold and approved-stack packages are in place

---

## Phase 2: User Story 1 — Live Tip Calculation (P1)

**Goal**: Enter bill + tip % + people → see live tip, total, per-person to 2 d.p.

### Tests (written first — must FAIL before implementation)

- [x] T002 [P] [US1] Unit tests for `calculateTip()` in `src/calculationUtils.test.ts`
  - $100 @ 20 % / 4 → tip=$20.00, total=$120.00, per-person=$30.00
  - $84.50 @ 18 % / 3 → tip=$15.21, total=$99.71, per-person=$33.24
- [x] T003 [P] [US1] Component tests in `src/TipSplitter.test.tsx`
  - Default render shows $84.50 / 18 % / 3 results
  - Changing bill updates outputs live
  - Clicking preset buttons recomputes outputs
  - Typing custom % overrides preset
  - Clicking preset after custom clears custom and recomputes

### Implementation

- [x] T004 [P] [US1] Create `src/calculationUtils.ts` — pure `calculateTip()` function
- [x] T005 [US1] Create `src/TipSplitter.tsx` — component with bill/tip/people inputs + live output
- [x] T006 [US1] Update `src/App.tsx` to mount `<TipSplitter />`

---

## Phase 3: User Story 2 — Edge Case Handling (P2)

**Goal**: people ≤ 0 or empty → "—" + hint; negative/empty bill → $0.

### Tests (written first — must FAIL before implementation)

- [x] T007 [P] [US2] Add edge-case tests to `src/TipSplitter.test.tsx`
  - people=0 → per-person "—" + hint visible
  - people empty → per-person "—" + hint visible
  - negative bill → tip=$0.00, total=$0.00
  - empty bill → tip=$0.00, total=$0.00
- [x] T008 [P] [US2] Add edge-case tests to `src/calculationUtils.test.ts`
  - negative bill → safeBill=0, all outputs 0
  - people=0 → perPerson=null

### Implementation

- [x] T009 [US2] Edge cases handled inside `calculateTip()` and `TipSplitter.tsx` (Math.max(0,…) + null guard)

---

## Phase 4: Polish

- [x] T010 [P] Write `src/App.test.tsx` smoke test to cover App.tsx lines
- [x] T011 Run `npm run ci` — fix until typecheck + lint + tests+coverage all green

---

## Dependencies & Execution Order

- T002, T003 (tests) written and confirmed RED before T004, T005
- T004 before T005 (component imports utility)
- T005 before T006 (App imports component)
- T011 last
