# Feature Specification: Portfolio Dashboard

**Feature Branch**: `feature/issue-41-portfolio-dashboard`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Investment portfolio dashboard — prefilled holdings, summary table with computed metrics, allocation chart, add/remove/edit/sort interactions."

## User Scenarios & Testing

### User Story 1 - View Portfolio Holdings (Priority: P1)

As an investor I want to see my holdings in a table with computed financial metrics so I can understand my portfolio performance at a glance.

**Why this priority**: Core value — without this, nothing else delivers.

**Independent Test**: Open the app; five rows appear with correct Market Value, Cost Basis, Gain/Loss $ and %, including TSLA showing a loss.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** it renders, **Then** all 5 initial holdings (AAPL, MSFT, GOOGL, AMZN, TSLA) appear in the table.
2. **Given** the app loads, **When** it renders, **Then** AAPL shows Market Value 1850.00, Cost Basis 1500.00, Gain/Loss +350.00, +23.3%.
3. **Given** the app loads, **When** it renders, **Then** TSLA shows Market Value 2460.00, Cost Basis 3000.00, Gain/Loss −540.00, −18.0%.
4. **Given** the app loads, **When** it renders, **Then** the totals row shows Market Value 8085.00, Cost Basis 7380.00, Gain/Loss +705.00.

---

### User Story 2 - Allocation Chart (Priority: P2)

As an investor I want a visual chart showing each holding's share of total portfolio market value so I can spot concentration quickly.

**Why this priority**: Visual complement to the table; chart must update with any data change.

**Independent Test**: Chart renders with all 5 tickers, bar widths proportional to market-value weights.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** it renders, **Then** an allocation chart displays each of the 5 tickers.
2. **Given** a holding is added or removed, **When** state updates, **Then** the chart reflects the new allocation percentages.

---

### User Story 3 - Add a Holding (Priority: P3)

As an investor I want to add a new holding via a form so I can track additional investments.

**Independent Test**: Enter NVDA (4, 400, 500), click Add; new row appears and total market value becomes 10085.00.

**Acceptance Scenarios**:

1. **Given** a valid form submission, **When** I add NVDA (4, 400, 500), **Then** NVDA appears in the table and totals update to 10085.00.
2. **Given** an incomplete form, **When** I click Add, **Then** no row is added.

---

### User Story 4 - Remove a Holding (Priority: P3)

As an investor I want to remove any holding so the portfolio stays current.

**Acceptance Scenarios**:

1. **Given** any holding exists, **When** I click its Remove button, **Then** the row disappears and totals recalculate.

---

### User Story 5 - Edit Current Price (Priority: P3)

As an investor I want to edit a holding's current price inline so market values update immediately.

**Acceptance Scenarios**:

1. **Given** AAPL is displayed, **When** I change its current price to 200.00, **Then** AAPL Market Value becomes 2000.00, totals update to 8235.00 total market value.

---

### User Story 6 - Sort Table (Priority: P3)

As an investor I want to sort by Market Value or Gain/Loss % (toggle desc/asc) so I can rank performers.

**Acceptance Scenarios**:

1. **Given** the table is unsorted, **When** I click "Gain/Loss %" header, **Then** rows sort descending — MSFT first, TSLA last.
2. **Given** sorted descending by Gain/Loss %, **When** I click the header again, **Then** rows sort ascending — TSLA first, MSFT last.
3. **Given** the table is unsorted, **When** I click "Market Value" header, **Then** rows sort descending — TSLA first (2460), AMZN last (555).

---

### Edge Cases

- Zero avg cost (cost basis = 0): Gain/Loss % shows 0% to avoid division by zero.
- All holdings removed: totals row shows 0.00 values.
- Non-numeric price input: treated as 0 until corrected.

## Requirements

### Functional Requirements

- **FR-001**: App MUST load 5 prefilled holdings on first render: AAPL (10 @ 150/185), MSFT (5 @ 300/420), GOOGL (8 @ 120/140), AMZN (3 @ 140/185), TSLA (12 @ 250/205).
- **FR-002**: App MUST compute Market Value (shares × current price), Cost Basis (shares × avg cost), Gain/Loss $ (MV − CB), Gain/Loss % (GL$ / CB × 100) for each holding.
- **FR-003**: App MUST show a totals row: sum of MV, CB, GL$, and overall GL%.
- **FR-004**: App MUST render an allocation chart using inline SVG — no external chart libraries.
- **FR-005**: App MUST allow adding a holding via a form (ticker, shares, avg cost, current price).
- **FR-006**: App MUST allow removing any holding; totals and chart update.
- **FR-007**: App MUST allow inline editing of the current price; computed values update reactively.
- **FR-008**: App MUST allow sorting by Market Value and Gain/Loss % with toggle desc/asc.
- **FR-009**: App MUST use React + TypeScript + Vite only; no chart or UI libraries.

### Key Entities

- **Holding**: `id` (string), `ticker` (string), `shares` (number), `avgCost` (number), `currentPrice` (number).

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 5 initial holdings render with correct computed values on first render.
- **SC-002**: TSLA displays as a loss (negative Gain/Loss $ and %).
- **SC-003**: Totals row sums correctly across all holdings.
- **SC-004**: Adding NVDA (4, 400, 500) produces total market value 10085.00.
- **SC-005**: Removing any holding recalculates totals and chart.
- **SC-006**: Editing AAPL price to 200 produces market value 2000.00 and total 8235.00.
- **SC-007**: Sorting by Gain/Loss % desc places TSLA last; asc places it first.
- **SC-008**: `npm run ci` (typecheck + lint + coverage ≥ 80%) passes.

## Assumptions

- All data is in-memory; no persistence between sessions.
- No authentication required.
- Numbers formatted to 2 decimal places (money) and 1 decimal place (percentages).
- Positive gain/loss prefixed with `+`, negative retains the `-` sign from `toFixed`.
- Inline SVG chart only — no charting libraries.
