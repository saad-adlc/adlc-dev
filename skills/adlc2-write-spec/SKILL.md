---
name: adlc2-write-spec
description: "ADLC v2 Phase 2 — Write spec.md from interview answers and present it for user confirmation. Called exclusively by adlc2-orchestrator after Phase 1 completes. Never triggered directly by user messages."
---

# Phase 2 — Write Spec

The spec is the contract. No issue is created and no code is written until the
user confirms it. The issue number — and therefore branch/workspace names — are
assigned at the END of Phase 2.5, so this spec carries no issue number.

## Stack mapping
React: .tsx/.ts, Vite · Angular: .ts/.html/.scss, CLI · .NET: .cs/.csproj ·
Java: .java, pom.xml

## Template

```markdown
# Spec: [Feature Title]

**Stack:** [React | Angular | .NET | Java]
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
- [made because user did not specify]

## Out of scope
- [explicit exclusions]
```

## Present and confirm
```
Here's the spec. Reply yes / looks good / proceed — or tell me what to change.
[spec]
```

## Revisions
Update only flagged sections, re-post. Max 2 rounds, then lock as-is.

## Exit
User confirms → adlc2-wireframe-preview (Phase 2.5). NOT straight to build.
