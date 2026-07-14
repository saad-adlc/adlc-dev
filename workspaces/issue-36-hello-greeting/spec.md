# Hello Greeting — Spec

## Summary
A single-page greeting app with a text input and a Greet button.

## Behaviour
- Render one text input labelled for a name, and one button labelled "Greet".
- On Greet (button click **or** Enter key in the input):
  - Trim leading/trailing whitespace from the input value.
  - If the trimmed value is non-empty, display `Hello, <name>!`.
  - If the trimmed value is empty, display `Hello, World!`.
- The greeting message is not shown before the first Greet action.

## Acceptance criteria
| Input | Expected output |
|-------|----------------|
| "Ada" | Hello, Ada! |
| "" (empty) | Hello, World! |
| "  Ada  " | Hello, Ada! |
| Enter key pressed | same as button click |

## Files
- `src/hello-greeting.tsx` — `HelloGreeting` component
- `src/hello-greeting.test.tsx` — unit tests (Vitest + Testing Library)
- `src/App.tsx` — mounts `HelloGreeting`
