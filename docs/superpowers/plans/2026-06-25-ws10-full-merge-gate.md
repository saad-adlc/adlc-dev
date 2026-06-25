# WS10 — Enforce the full merge gate (decouple `status.json`) — Implementation Plan

**Date:** 2026-06-25 · **Branch:** `adlc-dev@feature/ws10-merge-gate` · **Status:** planned
**Closes:** drift-log **D-8**. Lands via PR (main protected). Pairs with **D-7** (bot identity) for the human-approval half.

## Problem
Branch protection requires only the two **CodeQL `Analyze`** checks. `adlc-ci` (**CI — Node/React**) + **`adlc/business-approval`** *run* on the PR but **don't gate merge**: the `[skip ci]` `status.json` commits move the PR head **past** the code/CI commit (the "moving-head" problem). So a human could merge a PR whose head has absent/red CI — a hole in the no-direct-merge promise.

## Dependency map (verified)
**Head-movers — post-PR `[skip ci]` status commits (gh-aw path):**
- `adlc-status-pr.yml` → `pr-open`
- `adlc-ci.yml` → `clean`
- `adlc-preview.yml` → `deploying` / `preview-deployed` / `deploy-failed`
- `adlc-iterate.yml` → `iterating` / `escalated`

*(The agent's initial `scaffolding` `status.json` is in the **code commit** — fine, that's the CI commit. Iterate's **fix** commits are real code → re-trigger CI → fine.)*

**Reader:** the WS7 bootstrap monitor — reads `status.json.preview_url` **or** the preview comment.

## Locked decisions (grill, 2026-06-25)
- **Q1 — channel:** post-PR status → **one PR comment, updated in place** (hidden marker `<!-- adlc-status -->`), carrying *stage + plain-English detail*.
- **Q2 — status.json:** keep the agent's **initial** `status.json` in the code commit (git-tracked record); **stop** updating it on the branch.
- **Q3 — preview:** **keep the dedicated "🔍 preview" comment separate** (the recognizable URL payoff). The status comment tracks lifecycle; the preview comment carries the URL.

## Design
- **New reusable upsert** — `.github/scripts/post-status-comment` (github-script-style; **TDD'd** like the deny hook): find the PR comment containing `<!-- adlc-status -->` → **update in place** (or create) with the rendered card `{stage, detail}`. Idempotent by marker.
- **Rewire** (replace each `[skip ci]` status commit with the upsert):
  | Workflow | Was | Becomes |
  |---|---|---|
  | `adlc-status-pr` | `pr-open` commit+push | **creates** the status comment |
  | `adlc-ci` (`Status -> clean`) | `clean` commit+push | **updates** it |
  | `adlc-preview` | `deploying`/`preview-deployed`/`deploy-failed` commits | **updates** it — **keeps** its dedicated 🔍 preview (URL) comment (Q3) |
  | `adlc-iterate` | `iterating`/`escalated` commit | **updates** it |
- **Keep** the agent's initial `status.json` (code commit) — no prep/agent change beyond confirming.
- **WS7** `adlc-bootstrap/SKILL.md` monitor → read the `<!-- adlc-status -->` comment as primary; preview URL still from the dedicated preview comment.
- **Rollout (safe order):** decouple the 4 workflows → run **one test generate** → confirm the PR **head** now carries `CI — Node/React` (green) + `adlc/business-approval` (and **no** `[skip ci]` commit moved the head) → **then** add both to branch-protection required checks (`gh api`, INFRA §F).

## Tasks (TDD-first)
1. `post-status-comment` script + tests (RED→GREEN): creates when absent, updates in place (idempotent), renders stage+detail. *(adlc-dev `.github/scripts/` + `test/`)*
2. Wire into `adlc-status-pr` / `adlc-ci` / `adlc-preview` / `adlc-iterate` — remove the `[skip ci]` commits; keep `adlc-preview`'s dedicated preview comment.
3. Update WS7 `adlc-bootstrap/SKILL.md` monitor (read the status comment).
4. **Test generate** (throwaway issue) → confirm the head carries `CI — Node/React` + `adlc/business-approval`; no head-moving `[skip ci]` commit.
5. Add `CI — Node/React` + `adlc/business-approval` to branch-protection required checks (`gh api`).
6. Update `PLAN.md` (WS10 → done) + `ADLC-HANDOFF.md` (§12.4 status.json-on-branch invariant → PR-comment channel) + drift-log **D-8 resolved**.

## Acceptance
- A generated PR's **head** has `CI — Node/React` + `adlc/business-approval` (no `[skip ci]` commit past them).
- Branch protection requires CodeQL **+ `CI — Node/React` + `adlc/business-approval`**; a PR with red CI or no approval **cannot merge**.
- Chat-side liveness intact (status comment + dedicated preview comment + native events); the preview comment still posts the clickable URL.

## Risks / depends
- If any workflow still pushes a `[skip ci]` commit, the head moves → required checks stuck. **Mitigation:** the test-generate validation (task 4) **before** adding required checks.
- `adlc/business-approval` as a required check is **pending** until `adlc-approved` → blocks merge until approval (the intent).
- The **human CODEOWNERS-approval** requirement still waits on the **distinct bot identity (D-7)** — else the solo maintainer can't approve the bot's own PR. WS10 lands the CI + approval-status requirement; human-review follows once D-7 exists.
