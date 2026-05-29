# Global behavior rules

These are behavior rules for the AI assistant.
They are intentionally short and should stay separate from framework-specific rules.

- Surface assumptions before implementation.
- Prefer the smallest change that solves the problem.
- Keep changes scoped to the request.
- Use verifiable checks before considering work complete.
- If the repository does not define a command or convention, do not invent one.

## Karpathy baseline (kept from prior ADLC standards)
- Read all relevant files before writing a single line of code.
- Never guess at an import — verify it exists first.
- Prefer editing existing files over creating new ones.
- When uncertain, output a question list — do not guess.
- Write the simplest code that satisfies the requirement.
- Never leave TODO comments in committed code.
- Always write tests alongside implementation, never after.
- If a requirement is ambiguous, output a spec question list before coding.
