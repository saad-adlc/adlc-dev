# Feature Specification: Unit Converter (Length)

**Feature Branch**: `feature/issue-54-unit-converter`

**Created**: 2026-06-25

**Status**: Approved

**Input**: User description: "A simple length unit converter: type a number, pick a from unit and a to unit, and see the converted value update live."

## User Scenarios & Testing

### User Story 1 - Live Length Conversion (Priority: P1)

A user types a number, selects source and target length units, and instantly sees the converted result with 4 decimal places.

**Why this priority**: This is the entire feature — all other behaviours are edge cases of the same interaction.

**Independent Test**: Render the component, change the input value and unit dropdowns, assert the result text updates accordingly.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** the user sees the default state, **Then** input=1, from=Meters, to=Feet, result="3.2808".
2. **Given** input=1 and from=Meters, **When** the user selects to=Inches, **Then** the result shows "39.3701".
3. **Given** input=1 and from=Feet, **When** the user selects to=Inches, **Then** the result shows "12.0000".
4. **Given** any valid input, **When** from and to are the same unit, **Then** the result equals the input to 4 decimal places.
5. **Given** from=Meters and to=Feet, **When** the user types 2, **Then** the result shows "6.5617".

---

### Edge Cases

- **Empty input**: shows the neutral hint "Enter a value" — never shows NaN or an error message.
- **Non-numeric input** (e.g. "abc"): shows "Enter a valid number" — no NaN, no crash.
- **Negative input**: treated the same as non-numeric — shows "Enter a valid number".
- **Same unit on both sides**: result equals the input unchanged (1.0000 for input=1).

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a number input pre-filled with 1.
- **FR-002**: System MUST provide a "from" unit dropdown pre-selected to Meters.
- **FR-003**: System MUST provide a "to" unit dropdown pre-selected to Feet.
- **FR-004**: System MUST support conversion among Meters, Feet, and Inches.
- **FR-005**: System MUST update the result live on every change to input or either dropdown.
- **FR-006**: System MUST display the result to exactly 4 decimal places.
- **FR-007**: System MUST display "Enter a value" when the input field is empty.
- **FR-008**: System MUST display a graceful hint (not NaN) for non-numeric or negative input.

### Key Entities

- **Unit**: one of `meters | feet | inches`; carries a display label and a metres-per-unit factor.
- **ConversionResult**: the formatted string shown in the result area ("3.2808", "Enter a value", or "Enter a valid number").

## Success Criteria

### Measurable Outcomes

- **SC-001**: `npm run ci` exits 0 (typecheck + lint + tests + coverage all green).
- **SC-002**: Line coverage ≥ 80% as enforced by `vitest --coverage`.
- **SC-003**: All six unit-pair conversions (m↔ft, m↔in, ft↔in) verified by unit tests.
- **SC-004**: Empty-input and invalid-input cases covered by component tests — no NaN appears.

## Assumptions

- No external API calls — all conversion factors are hard-coded constants.
- Mobile layout is not a target; the converter is centred on screen via CSS Modules.
- Three units (meters, feet, inches) only — no extensibility required for this MVP.
