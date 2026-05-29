# Governance notes

## Centrally maintained standards
This `adlc-standards` repo is the source of truth for ADLC pipeline behavior.
Workflows in `adlc-dev` clone it before every agent run.
Do not merge changes here without Adastra + Orix sign-off.

## Required customization before rollout into a target project
- Replace every `TODO` with real commands or paths from the target project repo.
- Confirm Angular, React, C#, and Java file globs match the actual repo.
- Keep `CLAUDE.md` in sync with `ai-dev/` content.

## Suggested rollout order
1. Pilot the standards in one consuming project.
2. Populate real build / test / lint commands in that project.
3. Turn on repository instructions in the developer IDE.
4. Add CI enforcement (linters / formatters / static analysis as required checks) once commands are confirmed.
