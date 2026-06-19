---
name: adlc2-write-spec
description: "ADLC v2 Phase 2 — Write spec.md from interview answers and present it for user confirmation. Called exclusively by adlc2-orchestrator after Phase 1 completes. Never triggered directly by user messages."
---

# Phase 2 — Write Spec

The spec is the contract. No issue is created and no code is written until the
user confirms it. The issue number — and therefore branch/workspace names — are
assigned at the END of Phase 2.5, so this spec carries no issue number.

Stack is always React (.tsx/.ts, Vite). The template has no stack field.

## Template

```markdown
# Spec: [Feature Title]

**Date:** [today]
*(Issue, branch, and workspace are assigned automatically when the build starts.)*

## What we're building
[2-3 plain-English sentences]

## Acceptance criteria
1. [ ] [independently verifiable]
2. [ ] ...

## Inputs and outputs
| Element | Type | Behaviour |
|---|---|---|

## Test requirements
- Unit tests for: [functions/components]
- Coverage: 80% lines minimum

## Assumptions
- [made because user did not specify, or decided on the user's behalf when delegated]

## Out of scope
- [explicit exclusions]

## Layout (agreed at wireframe)
*(Appended by the orchestrator at the end of Phase 2.5 — leave absent until then.)*

## Change log
*(Appended by CI — one dated entry per iteration. Leave absent until then.)*
```

## Present and confirm
```
Here's the spec. Reply yes / looks good / proceed — or tell me what to change.
[spec]
```

## Revisions
Update only flagged sections, re-post. Max 2 rounds, then lock as-is.
(A spec re-entered via SPEC ROLLBACK gets fresh rounds: the user asked for
the revision, so present the amended spec and confirm normally.)

## Exit
User confirms → adlc2-wireframe-preview (Phase 2.5). NOT straight to build.
