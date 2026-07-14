# Feature Specification: Canadian Take-Home Salary Calculator

**Feature Branch**: `feature/issue-59-canadian-take-home-salary-calculator`

**Created**: 2026-06-25

**Status**: Draft

**Input**: GitHub Issue #59 — Canadian take-home salary calculator (Ontario, 2024)

## User Scenarios & Testing

### User Story 1 - Enter salary and see take-home results (Priority: P1)

A user enters a gross salary (hourly or yearly) and immediately sees estimated take-home pay after
all 2024 deductions: federal income tax, Ontario provincial income tax, CPP, and EI.

**Why this priority**: Core value of the app — every other story builds on this calculation.

**Independent Test**: Enter $60,000 in yearly mode and verify three result cards appear (hourly, monthly, yearly) with calculated non-zero values.

**Acceptance Scenarios**:

1. **Given** the calculator is loaded, **When** the user enters $60,000 in yearly mode, **Then** result cards show take-home hourly, monthly, and yearly values.
2. **Given** a salary is entered, **When** the user switches modes (yearly ↔ hourly), **Then** the input converts to the equivalent value and results stay consistent.
3. **Given** $0 is entered, **When** the results render, **Then** all take-home values display as $0.

---

### User Story 2 - Tax breakdown table (Priority: P2)

The user can see a detailed table showing exactly how much tax falls in each federal and Ontario bracket,
plus CPP and EI line items, with an effective tax rate footer row.

**Why this priority**: Transparency into the calculation adds trust; dependent on US1 calculation logic.

**Independent Test**: Enter any positive salary, verify the table shows Federal rows, Ontario rows, CPP, EI, and a footer with the effective tax rate.

**Acceptance Scenarios**:

1. **Given** a salary of $60,000, **When** the breakdown table renders, **Then** it has columns Type / Bracket / Rate / Amount and rows for each federal bracket, each Ontario bracket, CPP, and EI.
2. **Given** the breakdown table is visible, **When** the user reads the footer, **Then** the effective tax rate is shown as a percentage.

---

### User Story 3 - Input validation (Priority: P3)

The calculator handles edge-case inputs (empty, $0, negative, unreasonably large) without crashing.

**Why this priority**: Defensive UX — lower priority because the happy path is the primary value.

**Independent Test**: Enter negative, empty, and an extremely large salary; verify correct messages with no JS errors.

**Acceptance Scenarios**:

1. **Given** the input is empty, **When** the page loads, **Then** no results appear and no error is shown.
2. **Given** a negative value is entered, **When** the page re-renders, **Then** an error message is shown and no results appear.
3. **Given** a value exceeding $10,000,000/year is entered, **When** results render, **Then** a warning is shown alongside the results.

---

### Edge Cases

- Income = $0: all deductions are zero; take-home is $0.
- Income at bracket boundary (e.g. $55,867): calculation uses boundary values correctly.
- CPP above maximum pensionable earnings ($68,500): contribution capped at $3,867.50.
- EI above maximum insurable earnings ($63,200): premium capped at $1,049.12.
- Income below BPA ($15,705 federal / $11,865 Ontario): net tax is zero for that level.

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept salary in hourly or yearly mode via a toggle; switching modes converts the current input value to the equivalent.
- **FR-002**: System MUST display the auto-calculated equivalent (e.g. "Hourly equivalent: $X/hr") as a read-only companion field.
- **FR-003**: System MUST apply 2024 federal income tax brackets (15% / 20.5% / 26% / 29% / 33%) with Basic Personal Amount credit of $15,705 at 15%.
- **FR-004**: System MUST apply 2024 Ontario provincial tax brackets (5.05% / 9.15% / 11.16% / 12.16% / 13.16%) with Basic Personal Amount credit of $11,865 at 5.05%.
- **FR-005**: System MUST deduct CPP at 5.95% on earnings between $3,500 and $68,500 (max $3,867.50).
- **FR-006**: System MUST deduct EI at 1.66% on earnings up to $63,200 (max $1,049.12).
- **FR-007**: System MUST display take-home pay as hourly (÷2,080), monthly (÷12), and yearly.
- **FR-008**: System MUST display an effective tax rate (total deductions ÷ gross income).
- **FR-009**: System MUST display a breakdown table: Type, Bracket, Rate, Amount — rows for federal brackets, Ontario brackets, CPP, EI; effective rate in footer.
- **FR-010**: System MUST show an error for negative values; a warning (not an error) for values >$10,000,000/year.

### Key Entities

- **TakeHomeResult**: gross income, federal tax, provincial tax, CPP, EI, take-home (hourly/monthly/yearly), effective rate, breakdown rows.
- **BracketDetail**: type label, bracket range string, rate string, signed amount (credits are negative).

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7 acceptance criteria from Issue #59 map to at least one passing test each.
- **SC-002**: `calculateTakeHome(60000)` federalTax ≈ $6,871.57 ±$1, provincialTax ≈ $2,781.53 ±$1.
- **SC-003**: `npm run ci` (typecheck + lint + tests + coverage) exits 0 with coverage ≥ 80% lines.
- **SC-004**: No runtime dependencies added beyond the scaffold.

## Assumptions

- Tax year: 2024 (most recent complete bracket data).
- Province: Ontario (hardcoded; no selector).
- Only Basic Personal Amount credits applied — no RRSP, union dues, or other deductions.
- Conversion: 2,080 hrs/year (40 hrs/week × 52 weeks); monthly = yearly ÷ 12.
- All calculation is client-side; no API calls.
- No new npm runtime packages (issue explicitly says "no new dependencies").
