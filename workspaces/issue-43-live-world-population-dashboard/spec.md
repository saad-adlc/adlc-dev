# Feature Specification: Live World Population Dashboard

**Feature Branch**: `feature/issue-43-live-world-population-dashboard`

**Created**: 2026-06-22

**Status**: Draft

**Input**: Issue #43 — Live World Population Dashboard

## User Scenarios & Testing

### User Story 1 - Live World Population Counter (Priority: P1)

A visitor sees the world population climbing in real time as a large headline number, with an annual-growth subtitle below it.

**Why this priority**: The world total is the centrepiece. Without it the dashboard delivers no value.

**Independent Test**: Render the component; assert the headline number is visible and changes when time advances by one second.

**Acceptance Scenarios**:

1. **Given** the page has loaded, **When** the headline number is inspected, **Then** it displays a formatted number ~8.3 billion with thousands separators.
2. **Given** the page has loaded, **When** 1 second passes, **Then** the world total counter has visibly updated.
3. **Given** any point in time, **When** the world counter is compared to the sum of continent counters, **Then** they are equal.

---

### User Story 2 - Six Continent Cards (Priority: P2)

Six continent cards are shown ordered most- to least-populous — Asia, Africa, Europe, North America, South America, Oceania — each with its own live counter, share %, and growth-rate badge.

**Why this priority**: The continent breakdown is the core analytical content of the dashboard.

**Independent Test**: Render the dashboard; assert all six continent names, counters, share labels, and rate badges are present.

**Acceptance Scenarios**:

1. **Given** the page has loaded, **When** the grid is inspected, **Then** exactly six cards appear in the specified order.
2. **Given** the page has loaded, **When** time advances, **Then** each continent counter changes by the expected amount based on its growth rate.
3. **Given** the page has loaded, **When** Europe's counter is inspected after time passes, **Then** it has decreased (negative growth −0.12%).
4. **Given** the page has loaded, **When** badge styles are inspected, **Then** Africa's rate badge has an info/blue accent and Europe's has a danger/red accent.

---

### User Story 3 - Source Footnote (Priority: P3)

A footer line names the data source and notes that all figures are statistical estimates.

**Why this priority**: Disclosure requirement; does not affect counter logic.

**Independent Test**: Render the dashboard; assert the footer text is present and contains "UN WPP 2024" or "Worldometer" and "estimates".

**Acceptance Scenarios**:

1. **Given** the page has loaded, **When** the footer is inspected, **Then** it references UN WPP 2024 / Worldometer and the word "estimates".

---

### Edge Cases

- Europe's growth rate is negative (−0.12%); its counter must decrease and the red badge must display the minus sign.
- Numbers must use `Intl.NumberFormat` thousands separators — no layout jumping (`font-variant-numeric: tabular-nums`).
- No runtime network calls after page load; all data is baked in at build time.
- The world total is always computed as the arithmetic sum of the six continent counters.

## Requirements

### Functional Requirements

- **FR-001**: The dashboard MUST display the world total as a live counter updating at least once per second.
- **FR-002**: The dashboard MUST display six continent cards in order: Asia, Africa, Europe, North America, South America, Oceania.
- **FR-003**: Each continent card MUST show: live counter, share of world population (%), annual growth rate (%).
- **FR-004**: The world total MUST equal the arithmetic sum of the six continent counters at all times.
- **FR-005**: All counters MUST be computed locally from baked-in reference data anchored to 2026-06-22T00:00:00Z; no runtime network calls.
- **FR-006**: Numbers MUST use thousands separators throughout.
- **FR-007**: Europe's counter MUST decrease (annual rate −0.12%).
- **FR-008**: Africa's growth-rate badge MUST use an info/blue accent; Europe's MUST use a danger/red accent; all others neutral.
- **FR-009**: A footer MUST name UN WPP 2024 / Worldometer and note figures are estimates.

### Key Entities

- **ContinentData**: `{ name, baseline, annualRatePct, sharePct }` — reference data baked in at build time.
- **DashboardState**: `{ nowMs }` — only live state; everything else is derived.

## Success Criteria

### Measurable Outcomes

- **SC-001**: World counter visibly increments at least once per second in the browser.
- **SC-002**: Sum of six continent counters always equals the world total.
- **SC-003**: Europe's counter decreases over time.
- **SC-004**: Vitest line coverage ≥ 80%.
- **SC-005**: `npm run ci` (typecheck + lint + test:coverage) passes green.

## Change log

- [2026-06-23] iteration-1: Added a live summary table beneath the six continent cards. The table lists each continent with its real-time population (ticking every second), its static share of world population, and its annual growth rate. Europe's growth rate is styled in red and Africa's in blue, consistent with the card badges. Triggered by business-user feedback requesting a tabular view of the continent data.

## Assumptions

- Geographic six-continent model; Antarctica excluded (no permanent population).
- Constant annual growth rate applied continuously from baseline timestamp — same interpolation real population clocks use.
- Figures are UN WPP 2024 estimates reconciled so continent totals sum to the world total and shares sum to 100%.
- Desktop-first layout; responsive grid ensures readability on narrower viewports.
- No user input, no settings, no backend.
