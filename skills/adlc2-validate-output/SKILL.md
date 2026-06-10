---
name: adlc2-validate-output
description: "ADLC v2 Phase 6 — Claude Code runs all validation checks in CI, fixing failures before opening the PR. Consulted by adlc2-orchestrator to narrate status. Never triggered directly by user messages."
---

# Phase 6 — Validate (CI)

## What happens (Claude Code in adlc-generate.yml, inside workspaces/[slug]/)
Runs `npm run ci` = typecheck (tsc --noEmit) + lint (eslint --max-warnings 0)
+ tests. Coverage via separate `test:coverage` script (NEVER `npm test -- --coverage`
— duplicate flag breaks vitest). Gate: 80% lines.
Plus: no committed node_modules/dist/coverage/.env · secret-pattern grep ·
banned-package grep (moment, full lodash).
.NET: dotnet build -warnaserror + dotnet test · Java: mvn compile + mvn test.

Fails are fixed in-run before the PR opens. Same check failing 3x → stage `escalated`.

Updates status.json: stage `validating`, detail = current check or fix.

## Narration
"Testing everything — type safety, code quality, and [N] automated tests. Nothing ships until all checks pass."

## If stage flips validating → generating repeatedly
Normal: Claude Code is fixing and re-checking. Only `escalated` needs user attention.
