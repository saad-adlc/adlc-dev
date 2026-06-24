# Feature Specification: Tip & Bill Splitter

**Feature Branch**: `feature/issue-45-tip-bill-splitter`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "A single-page tip & bill splitter: enter the bill, pick a tip %, and the number of people, and see the tip, grand total, and per-person amount update live."

## User Scenarios & Testing

### User Story 1 - Live Tip Calculation (Priority: P1)

The user enters a bill amount, selects a preset tip percentage (15 %, 18 %, or 20 %) or types a custom %, and enters the number of diners. The tip amount, grand total, and per-person share update instantly without any form submission.

**Why this priority**: This is the entire value of the feature — without live calculation nothing else matters.

**Independent Test**: Enter bill=$100, click 20 %, set people=4 → tip=$20.00, total=$120.00, per-person=$30.00.

**Acceptance Scenarios**:

1. **Given** bill=$100, tip=20 %, people=4, **When** the values are entered, **Then** tip amount=$20.00, grand total=$120.00, per-person=$30.00.
2. **Given** the page opens with defaults (bill=$84.50, tip=18 %, people=3), **When** the page renders, **Then** tip amount=$15.21, grand total=$99.71, per-person=$33.24.
3. **Given** any bill and people, **When** the user clicks a different preset button, **Then** all three results recompute immediately.
4. **Given** any bill and people, **When** the user types a non-empty custom %, **Then** it overrides the active preset and all three results recompute immediately.
5. **Given** a custom % is active, **When** the user clicks a preset button, **Then** the custom field clears and the preset drives the calculation.

---

### User Story 2 - Edge Case Handling (Priority: P2)

When people is 0 or empty the app shows "—" for the per-person field (never NaN or Infinity) plus a brief hint. A blank or negative bill is treated as $0.

**Why this priority**: Required by the acceptance criteria; prevents confusing or broken output.

**Independent Test**: Clear the people field → per-person shows "—" and hint; set bill to -50 → all amounts compute from $0.

**Acceptance Scenarios**:

1. **Given** a valid bill and tip, **When** people is cleared or set to 0, **Then** per-person shows "—" and a hint message; NaN and Infinity never appear.
2. **Given** bill is empty or negative, **When** any calculation runs, **Then** bill is treated as $0 and all amounts compute from $0.

---

### Edge Cases

- People empty or 0 → per-person = "—" + hint "Enter number of people".
- Negative bill → treated as $0 (Math.max(0, …)).
- Empty bill → treated as $0 (parseFloat("") → NaN → 0).
- Custom tip empty → active preset is used; custom tip non-empty → overrides preset.

## Requirements

### Functional Requirements

- **FR-001**: System MUST show a bill amount input (numeric); empty or negative values treated as $0.
- **FR-002**: System MUST provide preset tip buttons at 15 %, 18 %, and 20 %.
- **FR-003**: System MUST provide a custom tip % input; when non-empty it overrides the active preset.
- **FR-004**: System MUST show a people count input (whole number); values ≤ 0 or empty suppress per-person.
- **FR-005**: System MUST display tip amount, grand total, and per-person, updated live, formatted to 2 decimal places.
- **FR-006**: System MUST open pre-filled: bill=$84.50, tip=18 % active, people=3.
- **FR-007**: System MUST display "—" and a hint for per-person when people ≤ 0 or empty; no NaN or Infinity.

### Key Entities

- **BillState**: bill (string), tipPreset (15|18|20|null), customTip (string), people (string).
- **Derived totals**: tipAmount, grandTotal, perPerson (number | null).

## Success Criteria

### Measurable Outcomes

- **SC-001**: $100 @ 20 % / 4 → tip=$20.00, total=$120.00, per-person=$30.00.
- **SC-002**: $84.50 @ 18 % / 3 → tip=$15.21, total=$99.71, per-person=$33.24 (default load).
- **SC-003**: people=0 or empty → per-person shows "—", no NaN or Infinity in the DOM.
- **SC-004**: Negative or empty bill → tip=$0.00, total=$0.00.

## Assumptions

- No persistence; all state is ephemeral React state (page refresh resets to defaults).
- No external UI or chart libraries; approved stack only.
- Rounding is applied to displayed values via `toFixed(2)`; internal calculations use full float precision.
- Tip % is applied to the bill total; the result is then divided by people to get per-person.
