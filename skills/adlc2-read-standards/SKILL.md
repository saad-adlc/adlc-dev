---
name: adlc2-read-standards
description: "ADLC v2 Phase 4 — Claude Code loads adlc-standards rules in CI before writing code. Consulted by adlc2-orchestrator to narrate status. Never triggered directly by user messages."
---

# Phase 4 — Load Standards (CI)

## What happens (Claude Code in adlc-generate.yml)
Reads from saad-adlc/adlc-standards before writing any code:
- Always: CLAUDE.md · rules/global/behavior.md · rules/global/instruction-architecture.md
- Stack-specific: rules/[react|angular|dotnet|java]/style.md + validation/[stack]-validation.md
- Workflows: generate-feature.md · validate-output.md · create-pr.md · iterate.md

Updates status.json: stage `standards`.

## Narration
"Loading the company's coding standards so the app is built the way engineering expects."

## Note
This stage is fast — if status shows `standards` for long, treat as Phase 5 starting.
