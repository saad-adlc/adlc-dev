# Tasks: Live World Population Dashboard

**Input**: `spec.md`, `plan.md`

## Phase 1: Foundation

- [x] T001 Write `src/data/continents.ts` — baked-in reference data (BASELINE_MS, SECONDS_PER_YEAR, CONTINENTS array, WORLD_BASELINE)
- [x] T002 Write `src/utils/population.test.ts` — unit tests for computePopulation, formatNumber, world-sum invariant, negative-growth (Europe) — TESTS FIRST, must FAIL before implementation
- [x] T003 Write `src/utils/population.ts` — pure functions: computePopulation, getElapsedSeconds, computeContinentPopulations, computeWorldTotal, formatNumber — makes T002 pass

---

## Phase 2: User Story 1 — Live World Counter (P1)

**Goal**: World headline counter ticks every second; world total = sum of continents.

- [x] T004 Write `src/components/Dashboard.test.tsx` — render tests (world label, all six continents, share/rate badges, footer, Europe danger badge, Africa info badge, counter updates after timer advance) — TESTS FIRST
- [x] T005 Write `src/components/WorldTotal.tsx` — headline counter + subtitle section
- [x] T006 Write `src/components/ContinentCard.tsx` — continent name, live counter, share badge, rate badge (conditional danger/info/neutral)
- [x] T007 Write `src/components/Dashboard.tsx` — setInterval(1000), derives continents + worldTotal, renders WorldTotal + grid of ContinentCards + footer
- [x] T008 Update `src/App.tsx` — mount Dashboard

---

## Phase 3: Styling & Compliance

**Goal**: No layout jumping; responsive grid; source footnote; passes `npm run ci`.

- [x] T009 Write `src/index.css` — tabular-nums on counters, responsive auto-fit grid, badge colours (info/danger/neutral), footer style
- [x] T010 Import `index.css` in `src/App.tsx`
- [x] T011 Run `npm run ci` — fix any typecheck / lint / coverage issues until green

---

## Acceptance Criterion Traceability

| Criterion (spec.md) | Task(s) | Test |
|---|---|---|
| AC1: World counter ticks ≥1/s | T007 | Dashboard.test.tsx: "updates counter after 1 second" |
| AC2: Six continent cards | T006, T007 | Dashboard.test.tsx: "renders all six continents" |
| AC3: Share % and growth rate badges | T006 | Dashboard.test.tsx: "renders share percentages", "renders growth rate badges" |
| AC4: No network calls, baked-in data | T001, T007 | population.test.ts: invariant tests |
| AC5: World = sum of continents | T003, T007 | population.test.ts: "world total invariant" |
| AC6: Thousands separators | T003 | population.test.ts: "formatNumber" |
| AC7: Ordered most→least populous | T001 | Dashboard.test.tsx: card order |
| AC8: Europe decreases (negative growth) | T003, T006 | population.test.ts: "Europe negative growth" |
| AC9: Source footnote | T007 | Dashboard.test.tsx: "shows source footnote" |
