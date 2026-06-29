# Feature Specification: Hello World v2

**Feature Branch**: `feature/issue-65-hello-world-v2`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "A friendly greeting app — type a name, pick a greeting style, see a live greeting, count greets."

## User Scenarios & Testing

### User Story 1 — Live Greeting Composer (Priority: P1)

A user types a name and picks a greeting style; the greeting line updates instantly without any button press.

**Why this priority**: Core value of the app — everything else builds on the live greeting display.

**Independent Test**: Render the component, change the name input, verify the greeting text updates immediately.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** nothing is changed, **Then** the greeting reads "Hello, World!".
2. **Given** name is "Ada" and style is "Welcome", **When** viewed, **Then** greeting reads "Welcome, Ada!".
3. **Given** name is empty or whitespace, **When** viewed, **Then** greeting reads "Hello, World!" (falls back to "World").
4. **Given** a name with leading/trailing spaces, **When** viewed, **Then** spaces are trimmed before display.

---

### User Story 2 — Shout Toggle (Priority: P2)

A user enables the Shout toggle to see the greeting in ALL CAPS.

**Why this priority**: Enhances expressiveness; does not affect the core greeting flow.

**Independent Test**: Enable Shout, verify the greeting is fully uppercased.

**Acceptance Scenarios**:

1. **Given** Shout is off (default), **When** viewed, **Then** greeting uses normal casing.
2. **Given** Shout is toggled on, **When** viewed, **Then** greeting is uppercased (e.g., "HELLO, WORLD!").
3. **Given** Shout is on and name is "Ada", **When** style is "Hi there", **Then** greeting reads "HI THERE, ADA!".

---

### User Story 3 — Greet Counter (Priority: P3)

A user clicks the Greet button to track how many times they have greeted.

**Why this priority**: Fun engagement feature; independent of greeting composition and shout.

**Independent Test**: Click Greet button N times, verify counter displays "Greeted N times".

**Acceptance Scenarios**:

1. **Given** the app loads, **When** counter is checked, **Then** it reads "Greeted 0 times".
2. **Given** counter is at 2, **When** Greet is clicked, **Then** counter reads "Greeted 3 times".

---

### Edge Cases

- What happens when name is only whitespace? → Trimmed to empty, falls back to "World".
- What happens with very rapid style/name changes? → React re-renders synchronously; each render shows the correct current value.

## Requirements

### Functional Requirements

- **FR-001**: App MUST display a name text input pre-filled with "World".
- **FR-002**: App MUST display a style dropdown with options: Hello, Hi there, Welcome, Good day; default "Hello".
- **FR-003**: App MUST display a live greeting line composed as "‹style›, ‹name›!".
- **FR-004**: Greeting MUST update immediately on any name or style change.
- **FR-005**: Empty or whitespace-only name MUST fall back to "World" in the greeting.
- **FR-006**: Leading/trailing whitespace in the name input MUST be trimmed before use in the greeting.
- **FR-007**: A Shout toggle (checkbox) MUST uppercase the entire greeting when enabled; default off.
- **FR-008**: A Greet button MUST increment a visible counter; counter starts at 0 and displays "Greeted N times".

### Key Entities

- **GreetingStyle**: One of four string literals: "Hello" | "Hi there" | "Welcome" | "Good day".
- **AppState**: name (string), style (GreetingStyle), shout (boolean), count (number).

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 8 Vitest tests pass with coverage ≥ 80% lines/branches/functions.
- **SC-002**: `npm run ci` (typecheck + lint + test:coverage) exits 0.
- **SC-003**: Default render shows "Hello, World!" without any user interaction.
- **SC-004**: Shout toggle uppercases the full greeting string on each render.

## Assumptions

- No external API calls; all state is local React state (`useState`).
- No routing required; single-page component.
- CSS Modules for styling; no inline styles.
- No singular/plural distinction for "times" (always "Greeted N times").
