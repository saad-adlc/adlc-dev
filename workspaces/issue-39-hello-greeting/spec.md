# Feature Specification: Hello Greeting

**Feature Branch**: `feature/issue-39-hello-greeting`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "A small web page with a text box for my name and a Greet button."

## User Scenarios & Testing

### User Story 1 - Named Greeting (Priority: P1)

The user types their name into the input and clicks Greet (or presses Enter) to receive a personalised greeting.

**Why this priority**: Core feature — the page has no value without it.

**Independent Test**: Type "Ada" and click Greet; the page shows "Hello, Ada!".

**Acceptance Scenarios**:

1. **Given** the name input contains "Ada", **When** the user clicks Greet, **Then** the page shows "Hello, Ada!".
2. **Given** the name input contains "Ada", **When** the user presses Enter, **Then** the page shows "Hello, Ada!".

---

### User Story 2 - Empty-Box Fallback (Priority: P2)

When the user clicks Greet with nothing in the box, the page greets the world.

**Why this priority**: Prevents a broken-looking "Hello, !" message on first load.

**Independent Test**: Click Greet with an empty box; the page shows "Hello, World!".

**Acceptance Scenarios**:

1. **Given** the name input is empty, **When** the user clicks Greet, **Then** the page shows "Hello, World!".

---

### User Story 3 - Whitespace Trimming (Priority: P3)

Extra spaces around the name are ignored.

**Why this priority**: Polish — guards against "Hello,  Ada  !" when the user accidentally types spaces.

**Independent Test**: Type "  Ada  " and click Greet; the page shows "Hello, Ada!".

**Acceptance Scenarios**:

1. **Given** the name input contains "  Ada  ", **When** the user clicks Greet, **Then** the page shows "Hello, Ada!".
2. **Given** the name input contains only spaces, **When** the user clicks Greet, **Then** the page shows "Hello, World!" (all-space input treated as empty).

---

### Edge Cases

- What happens when the input contains only whitespace? → treated as empty → "Hello, World!".
- What happens when the user presses Enter repeatedly? → greeting updates each time.

## Requirements

### Functional Requirements

- **FR-001**: The page MUST render a text input labelled for a name.
- **FR-002**: The page MUST render a button labelled "Greet".
- **FR-003**: Clicking "Greet" MUST display `Hello, {trimmedName}!` where `trimmedName` is the trimmed value; if empty, display `Hello, World!`.
- **FR-004**: Pressing Enter inside the input MUST trigger the same greeting as clicking the button.
- **FR-005**: Leading and trailing whitespace MUST be stripped from the entered name before constructing the greeting.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Typing "Ada" and clicking Greet shows exactly "Hello, Ada!".
- **SC-002**: Clicking Greet with an empty box shows exactly "Hello, World!".
- **SC-003**: Typing "  Ada  " (extra spaces) and clicking Greet shows exactly "Hello, Ada!".
- **SC-004**: Pressing Enter in the input shows the same greeting as clicking the button.

## Assumptions

- Single-page, no routing or persistence needed.
- No styling framework required beyond plain HTML elements.
- Greeting is displayed on the same page below the form (no navigation).
