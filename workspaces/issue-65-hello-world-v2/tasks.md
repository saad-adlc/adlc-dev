# Tasks: Hello World v2

**Input**: spec.md + plan.md

## Phase 1: Setup (already scaffolded by ADLC)

- [x] T001 Workspace scaffold with package.json, vite.config.ts, tsconfig.json, eslint.config.mjs exists
- [x] T002 `npm install` completed (node_modules present)

---

## Phase 2: Spec / Plan / Tasks documents

- [x] T003 Write spec.md from spec-template → `workspaces/issue-65-hello-world-v2/spec.md`
- [x] T004 Write plan.md from plan-template → `workspaces/issue-65-hello-world-v2/plan.md`
- [x] T005 Write tasks.md from tasks-template → `workspaces/issue-65-hello-world-v2/tasks.md`

---

## Phase 3: User Story 1 — Live Greeting Composer (P1) 🎯 MVP

**Goal**: Name input + style dropdown produce a live greeting line.

**Independent Test**: Render component, change input, assert greeting text updates.

### Tests for US1 (write first — must FAIL before implementation)

- [x] T006 [US1] `greeting.test.ts` — unit tests for `composeGreeting` (basic, empty name, whitespace, trim)
- [x] T007 [US1] `hello-world.test.tsx` — renders "Hello, World!" on load; updates on name/style change; empty name falls back

### Implementation for US1

- [x] T008 [US1] Create `src/hello-world/greeting.ts` — pure `composeGreeting(name, style, shout)` function
- [x] T009 [US1] Create `src/hello-world/hello-world.tsx` — stateful component with name input + style dropdown
- [x] T010 [US1] Create `src/hello-world/hello-world.module.css` — layout styles
- [x] T011 [US1] Update `src/App.tsx` — mount `<HelloWorld />`

**Checkpoint**: "Hello, World!" displays on load; name/style changes update greeting live.

---

## Phase 4: User Story 2 — Shout Toggle (P2)

**Goal**: Checkbox that uppercases the entire greeting when enabled.

**Independent Test**: Toggle Shout on, assert greeting is ALL CAPS.

### Tests for US2

- [x] T012 [US2] `greeting.test.ts` — shout=true uppercases output (added to same file)
- [x] T013 [US2] `hello-world.test.tsx` — click Shout checkbox, assert greeting uppercased

### Implementation for US2

- [x] T014 [US2] `greeting.ts` — shout param already included in `composeGreeting`
- [x] T015 [US2] `hello-world.tsx` — Shout checkbox wired to `shout` state

**Checkpoint**: Shout toggle uppercases and restores greeting correctly.

---

## Phase 5: User Story 3 — Greet Counter (P3)

**Goal**: Greet button increments a visible count display.

**Independent Test**: Click Greet N times, assert counter shows "Greeted N times".

### Tests for US3

- [x] T016 [US3] `hello-world.test.tsx` — counter starts at 0; increments on each click

### Implementation for US3

- [x] T017 [US3] `hello-world.tsx` — Greet button + count state already included in component

**Checkpoint**: Counter starts at 0 and increments correctly.

---

## Phase 6: CI Gate

- [x] T018 Run `npm run ci` (typecheck + lint + test:coverage) — must exit 0 with coverage ≥ 80%

---

## Dependencies & Execution Order

- T003-T005 can run in parallel (documents)
- T006-T007 written before T008-T011 (TDD: tests first)
- T012-T013 written alongside T014-T015 (shout is part of greeting.ts from the start)
- T018 runs last
