---
name: adlc2-create-pr
description: "ADLC v2 Phase 7 — CI opens a documented pull request to adlc-dev/main. Consulted by adlc2-orchestrator to narrate status and record the PR. Never triggered directly by user messages."
---

# Phase 7 — Pull Request (CI)

## What happens (adlc-generate.yml)
Opens a PR: head feature/[slug] → base **adlc-dev/main** (always — adlc-staging
is private/inaccessible, never targeted). Title: `feat: [spec title] (issue #[N])`.
Body: summary, Closes #[N], changes table, tests table, validation checklist,
how-to-test steps, link to spec.md.

Updates status.json: stage `pr-open`, pr: [number].

## Narration
"Your app is built and all checks passed. It's now packaged up for engineering
review — and the system is doing a final automated review pass."

## Orchestrator actions on this stage
Record `pr` in state. Do NOT send the user to the PR — engineering reviews it;
the business user gets the live preview in Phase 9.

## Chat verification
`list_pull_requests` base main / `get_pr` — confirm PR exists for the branch.
