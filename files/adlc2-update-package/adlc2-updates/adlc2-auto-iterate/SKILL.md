---
name: adlc2-auto-iterate
description: "ADLC v2 Phase 8 — Self-healing loop in CI: fixes CI failures, CodeQL alerts, and review feedback automatically (max 3 attempts). Consulted by adlc2-orchestrator to narrate status, relay business-user feedback, and handle escalations. Never triggered directly by user messages."
---

# Phase 8 — Auto-Iterate (CI, self-healing)

This skill is the single source of truth for the escalation menu.

## Triggers (adlc-iterate.yml — all automatic)
| Trigger | Event |
|---|---|
| CI fails on an ADLC PR | workflow_run: adlc-ci, conclusion failure |
| Reviewer requests changes / comments | pull_request_review |
| Business-user feedback from chat | issue_comment starting `/adlc-iterate:` |

Guards: branch must start `feature/issue-` · **iteration cap 3** (counted from
`iteration-` commits on the branch) · pushes use ADLC_PAT so CI re-triggers.

## What Claude Code does per iteration
Read exact failure/comment → read current files → minimal fix only (no refactors,
no new deps, fix only what failed) → run npm run ci locally → commit
`fix([slug]): iteration-[N] — [what]` → push → CI re-runs.
**Append a dated entry to spec.md `## Change log`** — iteration number, what
triggered it, what changed — so the spec never drifts from the shipped code.
CodeQL: auto-fix HIGH/CRITICAL only; MEDIUM/LOW get an explanatory PR comment.

status.json: stage `iterating` (iteration: N, detail: what's being fixed, in
plain words) → `clean` when all green (hands off to Phase 9 deploy)
→ `escalated` if cap hit or same check fails 3x.

## Narration
iterating: "The system found an issue and is fixing it itself — attempt [N] of 3. No action needed."
clean: "All fixed and every check passes — publishing your preview now."

## Escalation (stage: escalated) — the ONLY case needing the user
Read status.json detail (paraphrase — never quote). Explain in plain language, offer:
(a) adjust the requirement — small change: orchestrator comments
    `/adlc-iterate: [new direction]` · spec-level change: orchestrator runs
    SPEC ROLLBACK (close PR/issue, back to Phase 2)
(b) Saad pushes a manual fix to the branch
(c) abandon the feature — orchestrator runs CANCEL
Never paste raw logs or stack traces to a business user.

## Relaying Phase 10 feedback (orchestrator does this)
`create_comment` on PR: `/adlc-iterate: [feedback restated precisely]`.
Labels are NOT reachable via MCP on existing PRs — comments are the channel.
