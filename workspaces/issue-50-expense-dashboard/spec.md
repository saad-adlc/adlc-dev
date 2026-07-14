# Feature Specification: Expense Dashboard

**Feature Branch**: `feature/issue-50-expense-dashboard`

**Created**: 2026-06-25

**Status**: Draft

**Input**: Issue #50 — "Expense dashboard"

## User Scenarios & Testing

### User Story 1 – View spending overview (Priority: P1)

As a user I want to see my total spend, transaction count, and a bar chart of spend
by category so I can understand where my money went at a glance.

**Why this priority**: The overview is the primary entry point and delivers the highest
summary value.

**Independent Test**: Navigate to `/overview` and verify the page renders the correct
total and chart without any other view.

**Acceptance Scenarios**:

1. **Given** the app is open at `/overview`, **When** the page loads, **Then** I see
   "Total Spent" labelled as `$604.84`.
2. **Given** the app is open at `/overview`, **When** the page loads, **Then** I see
   the transaction count `8`.
3. **Given** the app is open at `/overview`, **When** the chart renders, **Then** there
   is one bar per category (Bills, Food, Shopping, Transport) and the Bills bar is the
   tallest (Bills total = $200.00).
4. **Given** any amount, **When** it is displayed, **Then** it shows exactly 2 decimal
   places (e.g. `$604.84`, `$200.00`).

---

### User Story 2 – Browse and filter transactions (Priority: P2)

As a user I want to see a table of all expenses and filter by category so I can drill
into specific spending.

**Why this priority**: Supports the detail view needed to audit individual spend.

**Independent Test**: Navigate to `/transactions`, verify 8 rows render, then click a
category filter and verify only matching rows remain.

**Acceptance Scenarios**:

1. **Given** the app is open at `/transactions`, **When** the page loads, **Then** a
   table shows 8 rows (date, merchant, category, amount) plus a header row.
2. **Given** the Transactions view, **When** I click the "Food" filter button, **Then**
   only the 2 Food transactions are shown.
3. **Given** a category filter is active, **When** I click "All", **Then** all 8 rows
   are restored.
4. **Given** any amount cell, **When** it renders, **Then** it displays 2 decimal places.

---

### User Story 3 – Navigate between views via URL (Priority: P3)

As a user I want each view to have its own URL so I can bookmark or share a deep link.

**Why this priority**: Bookmarkable URLs are required but ancillary to the core data
display.

**Independent Test**: Load `/overview` and `/transactions` directly (via MemoryRouter in
tests) and confirm each renders the correct view; confirm that navigating via the nav
bar changes the active link.

**Acceptance Scenarios**:

1. **Given** the app, **When** I visit `/overview`, **Then** the Overview page renders
   and the Overview nav link is highlighted.
2. **Given** the app, **When** I visit `/transactions`, **Then** the Transactions page
   renders and the Transactions nav link is highlighted.
3. **Given** the app, **When** I visit `/` (root), **Then** I am redirected to
   `/overview`.

---

### Edge Cases

- What happens when there are no expenses? `grandTotal` returns `$0.00`; the chart
  renders no bars (handled by `maxTotal = 1` guard).
- All amounts use `Number.toFixed(2)` — floating-point addition is avoided in display.

## Requirements

### Functional Requirements

- **FR-001**: The app MUST expose two routes: `/overview` and `/transactions`, each with
  a unique URL.
- **FR-002**: The `/` route MUST redirect to `/overview`.
- **FR-003**: The Overview view MUST display the grand total as `$604.84` for the
  prefilled data.
- **FR-004**: The Overview view MUST display the count of transactions (8).
- **FR-005**: The Overview view MUST display a bar chart (inline SVG) with one bar per
  category; bar heights MUST be proportional to category totals.
- **FR-006**: The Transactions view MUST display all 8 expenses in a table (date,
  merchant, category, amount).
- **FR-007**: The Transactions view MUST provide category filter buttons (All + each
  distinct category); clicking a button MUST restrict the table to that category.
- **FR-008**: Money values MUST be displayed to exactly 2 decimal places.
- **FR-009**: The app is read-only — no add/edit/delete functionality.
- **FR-010**: Navigation MUST use a top nav bar with `react-router-dom` NavLinks.

### Key Entities

- **Expense**: `{ date: string; merchant: string; category: string; amount: number }`
- **Category**: one of `Bills | Food | Shopping | Transport` (derived from expense data)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Overview shows `$604.84` total and `8` transactions — verifiable by test.
- **SC-002**: Chart Bills bar height equals 100% of max; Bills total = $200.00 (tallest).
- **SC-003**: Transactions table renders 8 data rows; Food filter leaves exactly 2 rows.
- **SC-004**: `npm run ci` (typecheck + lint + tests + coverage ≥ 80%) exits 0.

## Assumptions

- Data is static and prefilled — no API, no persistence.
- No mobile-specific breakpoints required (responsive via CSS is fine but not mandated).
- Category list is derived at build time from the expense array (sorted alphabetically).
- `react-router-dom` (approved package) is used for routing; chart is inline SVG with
  no external library.
