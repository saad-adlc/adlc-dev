# Instruction architecture

## Structure (Claude-only ADLC variant)
- `CLAUDE.md` is the Claude-specific project context file (top level of `adlc-standards`).
- Stack-specific rules live under `ai-dev/rules/{stack}/`.
- Validation guidance lives under `ai-dev/validation/`.
- Pipeline slash-command definitions live under `ai-dev/workflows/`.

## Design intent
- Keep `CLAUDE.md` concise.
- Put detailed framework rules under `ai-dev/rules/`.
- Put validation guidance under `ai-dev/validation/`.
- Do not duplicate large bodies of text across files.

## Pipeline integration
The ADLC GitHub Actions workflow clones this entire `adlc-standards` repo at the start of every agent run and exposes `CLAUDE.md` + `ai-dev/` to the agent.
