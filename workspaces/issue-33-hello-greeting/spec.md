# Feature Specification: Hello Greeting

**Feature Branch**: `feature/issue-33-hello-greeting`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "A small web page with a text box for my name and a Greet button. When I enter my name and click Greet, the page greets me by name."

## User Scenarios & Testing

### User Story 1 - Greet by name (Priority: P1)

The user types their name into the text input and clicks the Greet button (or presses Enter). The page displays a personalised greeting using the trimmed name.

**Why this priority**: Core interaction — the entire feature is this greeting flow.

**Independent Test**: Render the component, type a name, click Greet, assert `Hello, {name}!` appears.

**Acceptance Scenarios**:

1. **Given** the page is loaded, **When** the user types "Ada" and clicks Greet, **Then** the page shows "Hello, Ada!"
2. **Given** the page is loaded, **When** the user types "  Ada  " (extra spaces) and clicks Greet, **Then** the page shows "Hello, Ada!" (whitespace trimmed)
3. **Given** the page is loaded, **When** the user types a name and presses Enter in the text box, **Then** the page shows the same greeting as clicking Greet

---

### User Story 2 - Default greeting when input is empty (Priority: P2)

The user clicks Greet with an empty input (or one containing only spaces). The page shows a fallback greeting rather than "Hello, !".

**Why this priority**: Important UX guard — prevents a broken-looking empty greeting.

**Independent Test**: Render the component, leave input empty, click Greet, assert "Hello, World!" appears.

**Acceptance Scenarios**:

1. **Given** the page is loaded with an empty input, **When** the user clicks Greet, **Then** the page shows "Hello, World!"
2. **Given** the page is loaded, **When** the user types only spaces and clicks Greet, **Then** the page shows "Hello, World!"

---

### Edge Cases

- What happens when the input contains only whitespace? Trimmed to empty string; shows "Hello, World!".
- What happens before Greet is clicked? No greeting message is rendered.

## Requirements

### Functional Requirements

- **FR-001**: The page MUST display a text input labelled for a name.
- **FR-002**: The page MUST display a button labelled "Greet".
- **FR-003**: Clicking Greet MUST display Hello, {name}! where {name} is the trimmed input value.
- **FR-004**: When the trimmed input is empty, clicking Greet MUST display "Hello, World!".
- **FR-005**: Pressing Enter while focused in the text input MUST trigger the same greeting as clicking Greet.
- **FR-006**: Leading and trailing whitespace MUST be stripped from the name before constructing the greeting.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Typing "Ada" and clicking Greet displays "Hello, Ada!".
- **SC-002**: Clicking Greet with an empty box displays "Hello, World!".
- **SC-003**: Typing "  Ada  " and greeting displays "Hello, Ada!".
- **SC-004**: Pressing Enter in the input box triggers the same greeting as clicking the button.
- **SC-005**: All tests pass; line/branch/function coverage >= 80%.

## Assumptions

- Single-page, client-side-only React component; no routing or persistence required.
- No external styling framework needed for the MVP.
- The page shows no greeting message on initial load.
