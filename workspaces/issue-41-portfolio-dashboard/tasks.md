# Tasks: Portfolio Dashboard

**Input**: `spec.md`, `plan.md`

## Phase 1: Foundational types and data

- [x] T001 Create `src/types.ts` — Holding interface, SortKey, SortDir
- [x] T002 Create `src/data.ts` — INITIAL_HOLDINGS (5 prefilled holdings)
- [x] T003 Create `src/utils.ts` — calcMarketValue, calcCostBasis, calcGainLossDollar, calcGainLossPct, fmtMoney, fmtSigned, fmtSignedPct

---

## Phase 2: Tests (written first — TDD)

**⚠️ All tests must be written BEFORE implementation and verified to fail**

- [x] T004 [US1] Test: all 5 tickers render on initial load
- [x] T005 [US1] Test: AAPL computed values correct (MV 1850.00, +350.00, +23.3%)
- [x] T006 [US1] Test: TSLA renders as a loss (MV 2460.00, −540.00, −18.0%)
- [x] T007 [US1] Test: totals row correct (MV 8085.00, CB 7380.00, GL +705.00)
- [x] T008 [US2] Test: allocation chart renders with aria-label
- [x] T009 [US3] Test: adding NVDA (4,400,500) inserts row, total MV = 10085.00
- [x] T010 [US4] Test: removing TSLA removes row, total MV = 5625.00
- [x] T011 [US5] Test: editing AAPL price to 200 → MV 2000.00, total 8235.00
- [x] T012 [US6] Test: sort by Gain/Loss % desc → MSFT first, TSLA last
- [x] T013 [US6] Test: sort by Gain/Loss % asc → TSLA first, MSFT last
- [x] T014 [US6] Test: sort by Market Value desc → TSLA first, AMZN last

---

## Phase 3: User Story 1 — Holdings Table (P1)

- [x] T015 [US1] Create `src/components/PortfolioTable.tsx` — table rows, totals row, sortable headers, inline price input, remove buttons with aria-labels
- [x] T016 [US1] Update `src/App.tsx` — holdings state, sort state, handleRemove, handlePriceChange, handleSort, render PortfolioTable
- [x] T017 Checkpoint: US1 tests pass

---

## Phase 4: User Story 2 — Allocation Chart (P2)

- [x] T018 [US2] Create `src/components/AllocationChart.tsx` — inline SVG horizontal bars, one per holding, proportional to market-value weight
- [x] T019 [US2] Mount AllocationChart in App.tsx (receives `holdings`, not `sortedHoldings`)
- [x] T020 Checkpoint: US2 tests pass

---

## Phase 5: User Story 3–6 — Interactions (P3)

- [x] T021 [US3] Create `src/components/AddHoldingForm.tsx` — controlled form, validation guard, onAdd callback
- [x] T022 [US3] Wire AddHoldingForm into App.tsx (handleAdd with useRef counter)
- [x] T023 Checkpoint: US3–US6 tests all pass

---

## Phase 6: CI

- [x] T024 Run `npm run ci` — fix typecheck, lint, and coverage failures until green
- [x] T025 Verify all acceptance criteria from spec.md map 1-to-1 to passing tests

---

## Dependencies & Execution Order

- T001–T003 (types/data/utils) before any component
- T004–T014 (tests) before implementation — must FAIL first
- T015–T016 before T017 checkpoint
- T018–T019 before T020 checkpoint
- T021–T022 before T023 checkpoint
- T024–T025 last
