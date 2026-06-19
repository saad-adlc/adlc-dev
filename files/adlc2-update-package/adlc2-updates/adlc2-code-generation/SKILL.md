---
name: adlc2-code-generation
description: "ADLC v2 Phase 5 — Claude Code writes tests then implementation in CI. Consulted by adlc2-orchestrator to narrate status. Never triggered directly by user messages."
---

# Phase 5 — Code Generation (CI)

## What happens (Claude Code in adlc-generate.yml)
- Tests FIRST (TDD): happy path, error states, edge cases from spec
  - [name].test.tsx · toBeInTheDocument(), not toBeDefined() · financials use
    toBeCloseTo, not toBe
  - CSS Modules in jsdom: assert data-health via toHaveAttribute, not toHaveClass
- Implementation per spec (including the Layout section), only inside workspaces/[slug]/
- Quality bar: no any without comment, no TODOs, files ≤300 lines, functions ≤40,
  JSDoc on public functions, named constants, kebab-case filenames,
  no banned packages (moment, full lodash), no secrets, no eval
- Commits: feat([slug]) / test([slug]) ... (issue #[N])

Updates status.json: stage `generating`, detail = current file/component
described in PLAIN WORDS (e.g. "the amortization engine") — never file paths
or error codes; the chat narrates detail to a business user.

## Narration
"Writing your app now — tests first, then the working code. Currently on: [paraphrased detail]."

## Hard constraints CI enforces
Only the workspace is touched. No CI workflow, root config, or other-workspace edits.
