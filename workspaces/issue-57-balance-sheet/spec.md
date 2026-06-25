# Feature Specification: Balance Sheet

**Feature Branch**: `feature/issue-57-balance-sheet`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "A simple balance sheet I can fill in and instantly see whether it balances."

## User Scenarios & Testing

### User Story 1 — View and Edit Balance Sheet Sections (Priority: P1)

A user opens the app and sees three sections (Assets, Liabilities, Equity) pre-filled with sample
data. They can add and remove lines, edit names and amounts, and each section's subtotal updates
immediately as they type.

**Why this priority**: Core data-entry flow — nothing else works without it.

**Independent Test**: Load the app; all three sections render with sample entries; edit an amount
and verify the subtotal changes.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** the page renders, **Then** three sections — Assets,
   Liabilities, Equity — are visible with the prefilled sample data (Cash 12,000; Accounts
   receivable 8,000; Equipment 30,000; Accounts payable 6,000; Bank loan 20,000; Common stock
   15,000; Retained earnings 9,000).
2. **Given** a section is showing, **When** I click "+ Add line", **Then** a new empty line
   appears in that section.
3. **Given** a line exists, **When** I click the remove button, **Then** the line disappears and
   the subtotal updates.
4. **Given** a line exists, **When** I type a new number in the amount field, **Then** the section
   subtotal updates immediately.

---

### User Story 2 — Balance Status Display (Priority: P2)

The user sees whether the sheet is "in balance" (Total Assets == Total Liabilities + Equity to the
cent). When out of balance, they see the exact dollar difference and which side is heavier.

**Why this priority**: Core purpose of a balance sheet — without this, the tool has no value
beyond a list editor.

**Independent Test**: Load the app (sample data balances at 50,000). Edit one amount so it's
unequal; verify the out-of-balance message appears with the correct difference.

**Acceptance Scenarios**:

1. **Given** the app loads with sample data, **When** the page renders, **Then** "In balance" is
   shown and Total Assets and Total Liabilities + Equity are both displayed.
2. **Given** the sheet is in balance, **When** I change an Assets amount so total exceeds claims,
   **Then** an out-of-balance message shows the exact difference and "assets exceed claims".
3. **Given** the sheet is in balance, **When** I change an Equity amount so claims exceed assets,
   **Then** an out-of-balance message shows the exact difference and "claims exceed assets".

---

### User Story 3 — Input Validation (Priority: P3)

Blank and non-numeric inputs are handled gracefully — blank counts as 0, non-numeric is flagged and
excluded from totals without breaking anything.

**Why this priority**: Data integrity — totals must be reliable even when the user is mid-edit.

**Independent Test**: Enter "abc" in an amount field; verify it is flagged and the subtotal does
not include that value.

**Acceptance Scenarios**:

1. **Given** an amount field is blank, **When** computing totals, **Then** it counts as 0 with no
   error shown.
2. **Given** an amount field contains "abc", **When** the user types it, **Then** the field is
   marked invalid and excluded from the subtotal without affecting other fields.
3. **Given** an amount field contains "-5000", **When** entered, **Then** it is included in the
   subtotal as a negative number.

---

### User Story 4 — Balance Visual (Priority: P4)

An inline SVG shows the two sides (Assets vs Liabilities+Equity) proportionally, making the
balance relationship obvious at a glance.

**Why this priority**: Visual aid for quick orientation — useful but not core functionality.

**Independent Test**: Load the app; the SVG with two labelled bars is visible.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** the page renders, **Then** an SVG balance visual is shown
   with bars for Assets and for Liabilities+Equity.
2. **Given** the sheet is in balance, **When** viewing the visual, **Then** both bars have the
   same width.

---

### Edge Cases

- Non-numeric amounts (e.g. "abc") must be flagged and excluded without breaking any total.
- A blank amount counts as 0 and must not be flagged.
- Negative amounts (e.g. accumulated depreciation) must be accepted and summed correctly.
- Removing all lines from a section leaves its subtotal at $0.00.
- When both totals are zero, the visual renders with no bars shown.

## Requirements

### Functional Requirements

- **FR-001**: System MUST render three sections: Assets, Liabilities, and Equity.
- **FR-002**: Each section MUST display a running subtotal that updates on every keystroke.
- **FR-003**: Users MUST be able to add and remove line items in any section.
- **FR-004**: Users MUST be able to edit any line item's name and amount.
- **FR-005**: System MUST show "In balance" only when Total Assets equals Total Liabilities +
  Total Equity (to the cent).
- **FR-006**: When out of balance, system MUST show the exact dollar difference and indicate which
  side is heavier ("assets exceed claims" or "claims exceed assets").
- **FR-007**: A blank amount MUST count as 0.
- **FR-008**: A non-numeric, non-empty amount MUST be flagged visually and excluded from totals.
- **FR-009**: Negative amounts MUST be accepted and included in totals.
- **FR-010**: System MUST render an inline SVG balance visual reflecting current totals.
- **FR-011**: App MUST load with prefilled sample data balancing at Assets 50,000 = Liabilities
  26,000 + Equity 24,000.

### Key Entities

- **LineItem**: `id` (string), `name` (string), `amount` (string — raw user input).
- **SectionId**: `'assets' | 'liabilities' | 'equity'`.

## Success Criteria

- **SC-001**: Prefilled sample data renders on first load and the balance indicator shows "In
  balance".
- **SC-002**: Adding, removing, or editing any line updates the subtotals and balance status within
  the same render cycle.
- **SC-003**: Non-numeric input is visually flagged and excluded from totals without affecting
  other fields or breaking the balance calculation.
- **SC-004**: The inline SVG visual renders and reflects the proportional relationship between the
  two sides.

## Assumptions

- All data is in-memory only; no persistence across page reloads is required.
- Currency is USD; formatting uses commas and two decimal places.
- The visual is a simple two-bar SVG comparison; no animation or interactivity needed.
- Negative amounts are valid (e.g. accumulated depreciation) and handled by standard arithmetic.
- No external libraries or new npm packages are needed.
