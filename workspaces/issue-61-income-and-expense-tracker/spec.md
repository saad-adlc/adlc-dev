# Feature Specification: Income & Expense Tracker

**Feature Branch**: `feature/issue-61-income-and-expense-tracker`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: GitHub issue #61 — Income and Expense Tracker

## User Scenarios & Testing

### User Story 1 - Add and Persist Transactions (Priority: P1)

A user opens the app and records a transaction (income or expense) with an amount, type,
category, optional note, and date. The entry appears in the list immediately and survives a
page reload via localStorage.

**Why this priority**: Without transaction logging the entire app has no data to work with.

**Independent Test**: Add a transaction via the form, verify it appears in the list, reload
the page and confirm it is still there.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user fills in amount / type / category / date and
   submits, **Then** the transaction appears in the transaction list.
2. **Given** a transaction has been added, **When** the page is reloaded, **Then** the
   transaction is still visible (persisted to localStorage).
3. **Given** the amount field is empty or zero, **When** the user submits, **Then** the form
   does not submit and no transaction is added.

---

### User Story 2 - Delete a Transaction (Priority: P2)

A user removes an existing transaction row by clicking its delete button. The row disappears
and all totals update immediately.

**Why this priority**: Completes the write lifecycle — no edit, so delete-and-re-add is the
correction path.

**Independent Test**: Add a transaction then delete it; verify the list is empty and totals
reset to zero.

**Acceptance Scenarios**:

1. **Given** one transaction exists, **When** the user clicks its delete button, **Then** the
   row is removed and the summary totals update.

---

### User Story 3 - Dashboard Summary (Priority: P2)

Summary cards show correct total income, total expenses, and balance for the currently
selected month.

**Why this priority**: Core read-side value — users need their financial position at a glance.

**Independent Test**: Add income and expense transactions; verify the three cards show the
right computed values.

**Acceptance Scenarios**:

1. **Given** no transactions exist, **When** the dashboard loads, **Then** all three cards
   show $0.00.
2. **Given** income $200 and expense $80 in the current month, **When** the user views the
   dashboard, **Then** income = $200.00, expenses = $80.00, balance = $120.00.

---

### User Story 4 - Budget Tracking (Priority: P3)

A user sets a monthly budget limit per category. Budget rows show spent vs. limit and the
progress bar changes colour as the limit is approached or exceeded.

**Why this priority**: Proactive spending control on top of the transaction log.

**Independent Test**: Set a budget, add expense transactions, verify bar colour changes at
the correct thresholds.

**Acceptance Scenarios**:

1. **Given** budget $100 for Food, **When** $80 is spent (80%), **Then** bar is green.
2. **Given** budget $100 for Food, **When** $90 is spent (90%), **Then** bar is amber.
3. **Given** budget $100 for Food, **When** $100+ is spent (≥100%), **Then** bar is red.

---

### User Story 5 - Month Navigation (Priority: P3)

Prev/Next buttons change the selected month; dashboard figures and transaction list filter
to that month only.

**Why this priority**: Historical data review without the app becoming cluttered.

**Independent Test**: Add transactions in two different months; navigate between them and
verify the list filters correctly.

**Acceptance Scenarios**:

1. **Given** the current month is selected, **When** Prev is clicked, **Then** the previous
   month is selected and figures update.
2. **Given** January is selected, **When** Prev is clicked, **Then** December of the prior
   year is shown.

---

### Edge Cases

- Zero transactions: all summary cards show $0.00; transaction list shows an empty-state message.
- No budget set for a category: progress bar stays green and shows "no limit".
- Malformed localStorage data: silently falls back to an empty array or empty object.
- Balance negative: formatted as -$X.XX.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow adding a transaction with amount, type (income/expense), category, optional note, and date.
- **FR-002**: Transactions MUST persist to localStorage and survive page reloads.
- **FR-003**: System MUST allow deleting any individual transaction.
- **FR-004**: Dashboard MUST display correct total income, expenses, and balance for the selected month.
- **FR-005**: System MUST allow setting a monthly budget per category, persisted to localStorage.
- **FR-006**: Budget progress bars MUST reflect spent vs. budget and use green / amber / red colour states.
- **FR-007**: Month navigator MUST filter dashboard and transaction list to the selected month.
- **FR-008**: App MUST handle zero-data empty state gracefully (no crashes, meaningful messages).

### Key Entities

- **Transaction**: `id` (uuid), `amount` (number), `type` (`'income' | 'expense'`), `category` (string), `note` (string), `date` (ISO YYYY-MM-DD)
- **Budget**: Per-category, per-month dollar amount. Stored keyed by `"YYYY-MM"` in localStorage.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7 acceptance criteria from issue #61 are implemented and covered by tests.
- **SC-002**: `npm run ci` (typecheck + lint + tests + coverage) passes with ≥ 80% line coverage.
- **SC-003**: App renders correctly with zero transactions in localStorage.
- **SC-004**: No TypeScript errors, no ESLint warnings, no TODO comments.

## Assumptions

- Default categories are pre-loaded: Food, Transport, Housing, Entertainment, Health, Other.
- Currency display is CAD $ — no conversion, format only.
- No editing of transactions — users delete and re-add.
- Budgets are per-category per-month; they do not carry forward automatically.
- No user accounts; all data stored in the browser's localStorage.
- No external npm packages required beyond the existing scaffold.
