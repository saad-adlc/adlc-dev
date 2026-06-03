# Spec: Hello World with User-Entered Name

**Issue:** #1
**Stack:** React
**Branch:** `feature/hello-world-name-input`
**Date:** 2026-06-03

## What we're building
A standalone React page where a user can type their name into an input field and click a button to see a personalised "Hello, [name]!" greeting. The page validates input before displaying the greeting, blocking empty submissions, names over 50 characters, and names containing special characters.

## Acceptance criteria
1. [ ] A text input field is rendered on the page
2. [ ] Submitting a valid name displays "Hello, [name]!" on the page
3. [ ] Submitting an empty name shows an inline error: "Name is required"
4. [ ] Entering more than 50 characters shows an inline error: "Name must be 50 characters or fewer"
5. [ ] Entering special characters (non-alpha, non-space) shows an inline error: "Name may only contain letters and spaces"
6. [ ] Only one error is shown at a time (priority: empty → special chars → length)
7. [ ] Error clears when the user corrects their input

## Files to create
| Path | Purpose |
|------|---------|
| `src/pages/HelloWorld/HelloWorldPage.tsx` | Standalone page component with input, button, greeting, and validation |
| `src/pages/HelloWorld/HelloWorldPage.test.tsx` | Unit tests for all acceptance criteria |
| `src/pages/HelloWorld/index.ts` | Barrel export |

## Files to modify
| Path | Change |
|------|--------|
| `src/App.tsx` (or router file) | Add route for the new HelloWorld page |

## Files NOT to touch
- Everything not listed above
- Any existing pages or components

## Dependencies
- None — uses React built-ins only (`useState`)

## Test requirements
- Unit tests for: input rendering, valid submission, empty error, special char error, max length error, error clearing
- Coverage target: ≥ 80% lines
- Test file location: `src/pages/HelloWorld/HelloWorldPage.test.tsx`

## Assumptions
- Repo `adlc-dev` uses a standard Vite + React + TypeScript setup with a `src/` directory
- Routing is handled by React Router already present in the project
- No styling framework specified — will use plain CSS or inline styles; can be updated if a design system is in use

## Out of scope
- Backend/API integration
- Authentication or user sessions
- Persisting the entered name across page reloads
