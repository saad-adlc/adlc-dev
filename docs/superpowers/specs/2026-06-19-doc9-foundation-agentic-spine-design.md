# Doc-9 Foundation + Agentic Spine — Design

**Date:** 2026-06-19
**Author:** Saad Anwar (with Claude / Opus 4.8)
**Status:** Draft — awaiting user review (brainstorming gate)
**Source of truth this refines:** `PLAN.md` (WS0, WS2, WS3, WS4) + `9_ADLC_Solution.md` + `ADLC-HANDOFF.md`

---

## Goal

Build the doc-9 **foundation + agentic spine** in one dependency chain: author the Spec-Kit constitution + steering set + deterministic deny hooks in `adlc-standards` (WS0), wire the hooks into CI (WS4), and port both `adlc-generate` and `adlc-iterate` to gh-aw as the primary orchestration engine (WS2/WS3). End state: labelling an issue `adlc-generate` runs a gh-aw workflow that produces a Spec-Kit-structured PR via claude-code-action (Foundry-billed), with deterministic `PreToolUse` enforcement active.

## Scope (this slice)

**In:** WS0 (constitution + steering + hooks in `adlc-standards`), WS4 (deny hooks wired into CI), WS2 (gh-aw `adlc-generate.md` + park hand-rolled), WS3 (claude-code-action via gh-aw `engine: claude`, folded into WS2), gh-aw `adlc-iterate.md` + park hand-rolled.

**Out (follow-on plans):** WS1 (vendor-sync bot), WS5 (dependabot + security-iterate guard commit), WS6 (CODEOWNERS + business-approval check), WS7 (claude.ai bootstrap skill). Manual GitHub infra (branch protection, required checks, secrets) — lives in `INFRA-SETUP.md`, not code.

## Locked decisions (from the grill, 2026-06-19)

| # | Decision | Choice |
|---|----------|--------|
| G1 | Model for this effort | **Opus 4.8** (`claude-opus-4-8`); subagents dispatched with this model |
| G2 | Branches | `adlc-dev`: **`ws-doc9-impl`** from `origin/main`; `adlc-standards`: **`ws-doc9-standards`** from `origin/main` |
| G3 | Spec-Kit depth | **Structured artifacts** — agent emits `spec.md` + `plan.md` + `tasks.md` in Spec-Kit template format, TDD-implements, runs an analyze-style self-check, commits all three as the audit trail. Stays on the proven claude-code-action path; portable to full slash-command spine later. |
| G4 | Session scope | **Foundation + agentic spine** (WS0 → WS4 → WS2/WS3) |
| G5 | Deterministic/agentic split | Deterministic gh-aw `steps:` own slug derivation, byte-identical scaffolding, npm install, status.json transitions, deny-hook mounting. Agent owns spec/plan/tasks + TDD code + analyze self-check. `create_pull_request` safe-output opens the PR. |
| G6 | Branch-name control | `create_pull_request` uses the explicit **`branch`** field = `feature/issue-<N>-<slug>`, preserving the byte-identical slug invariant (HANDOFF §3, §12.1) |
| G7 | Iterate push mechanism | gh-aw **`push_to_pull_request_branch`** safe-output for fix commits |
| G8 | Iteration cap | Enforced **deterministically** in a pre-agent step (count `iteration-` commits since `main`, cap 3) — never trusted to the prompt |
| G9 | status.json channel | **Preserved as-is** (HANDOFF invariant §12.4); written/pushed by deterministic steps at each phase transition |
| G10 | Secret for gh-aw path | **`ANTHROPIC_API_KEY`** (Foundry key value) + `ANTHROPIC_BASE_URL=https://orix-adastra-adlc.services.ai.azure.com/anthropic`, model `claude-sonnet-4-6`. Strict mode: key is NOT in `engine.env`. |

## Architecture

### gh-aw `adlc-generate.md` (PRIMARY; replaces hand-rolled trigger)

```
on: issues: types: [labeled]   (guard: label == 'adlc-generate')
engine: claude (claude-code-action, Foundry base-url)
permissions: read-all (default) ; safe-outputs gate the writes

steps: (deterministic — gh-aw custom steps before the agent)
  1. checkout adlc-dev (ADLC_AGENT_TOKEN)
  2. clone adlc-standards → mount constitution.md, steering/, skills/, hooks/
  3. derive slug (byte-identical algo, HANDOFF §3) → feature/issue-<N>-<slug>
  4. scaffold workspaces/<slug>/ (package.json, tsconfig, vite, eslint, index.html, src/*) + npm install
  5. write + push status.json: stage=scaffolding   (early push so chat can poll)
  6. mount .claude/settings.json (PreToolUse deny hook) into workdir
  7. fetch issue body/comments → issue_context
  8. write status.json: stage=generating

agent body:
  - read constitution.md + steering/approved-stack.md + steering/compliance-rules.md
  - write spec.md  (Spec-Kit spec template, from issue intent)
  - write plan.md  (file map + interfaces)
  - write tasks.md (TDD task list mapped to acceptance criteria)
  - TDD implement inside workspaces/<slug>/src/ (RED → GREEN)
  - analyze-style self-check: every AC maps to a task/test; no placeholders
  - run `npm run ci` (tsc + eslint + vitest ≥80%); fix until green
  - DO NOT commit, DO NOT touch status.json (deny hook + prompt both enforce)

safe-outputs:
  create_pull_request: branch=feature/issue-<N>-<slug>, base=main,
    labels=[adlc-generated], title/body from spec
  (post: deterministic step writes status.json stage=pr-open)
```

### gh-aw `adlc-iterate.md` (PRIMARY; replaces hand-rolled trigger)

```
on: (4 triggers, same as hand-rolled)
  - workflow_run: ADLC CI completed=failure on feature/issue-*
  - pull_request_review: changes_requested
  - pull_request: labeled adlc-iterate
  - issue_comment: starts '/adlc-iterate:'

steps: (deterministic)
  1. resolve branch/PR/task from event (github-script, as today)
  2. ENFORCE CAP: count iteration- commits since main; if ≥3 → escalate
     (write status.json stage=escalated, comment, exit) — NO agent run
  3. checkout feature branch ; clone standards ; mount deny hooks
  4. write status.json stage=iterating (rides along with the fix commit)

agent body:
  - read constitution + react rules ; read failing context (CI log / review / feedback)
  - minimal fix only (no refactors, no new deps, no deleted tests)
  - run npm run ci until green
  - update status.json detail (plain language) + append spec.md ## Change log

safe-outputs:
  push_to_pull_request_branch  (the fix commit; PAT push retriggers CI = the loop)
  add_comment (progress)
```

### Parking the hand-rolled fallback

When each gh-aw twin goes live, change the hand-rolled `.yml`'s `on:` to `workflow_dispatch` only (logic untouched). `adlc-ci.yml` and `adlc-preview.yml` stay as real Actions (not agentic, not ported). `adlc-security-iterate.yml` / `adlc-signals.yml` stay until/if ported. AC: no event fires both a gh-aw lock workflow and its hand-rolled twin (no double-runs).

## File structure

### `adlc-standards` (branch `ws-doc9-standards`) — WS0

- **Create** `constitution.md` — Spec-Kit project constitution (security + behavior + DoD extracted from `CLAUDE.md`)
- **Create** `steering/AGENTS.md`, `steering/approved-stack.md` (React+TS+Vite+Vitest only; multi-stack = future), `steering/compliance-rules.md`
- **Create** `hooks/pretooluse-deny.sh` (deny: push/merge to main; Write/Edit outside `workspaces/<slug>/`; secret patterns; dangerous Bash) + `hooks/settings.template.json` (registers the hook)
- **Modify** `CLAUDE.md` → defer to constitution + steering (no duplicated rules; HANDOFF/PLAN: "no rule lives in two files")

### `adlc-dev` (branch `ws-doc9-impl`) — WS4 + WS2 + WS3

- **Create** `.github/workflows/adlc-generate.md` + `adlc-generate.lock.yml`
- **Create** `.github/workflows/adlc-iterate.md` + `adlc-iterate.lock.yml`
- **Modify** `.github/workflows/adlc-generate.yml`, `adlc-iterate.yml` → `on: workflow_dispatch` (parked)
- **Verify** `.gitattributes` has `*.lock.yml linguist-generated=true merge=ours`

## Acceptance criteria

1. CI clone of `adlc-standards` exposes constitution, steering, hooks; no rule lives in two files (WS0 AC).
2. A deliberate test prompt that tries to write outside the workspace / push to main / write a fake secret is **blocked by the deny hook**, visible in the run log, rest of run unaffected (WS4 AC).
3. Labelling an issue `adlc-generate` fires **only** the gh-aw lock workflow (no double-run); parked hand-rolled runs only via manual dispatch (WS2 AC).
4. A full gh-aw generate run produces `spec.md`+`plan.md`+`tasks.md`+TDD code via claude-code-action, Foundry-billed, opens a PR on `feature/issue-<N>-<slug>`, never auto-merged (WS2/WS3 AC).
5. `gh aw compile` is clean; lock files committed.
6. Iterate: a CI failure / review / `/adlc-iterate:` comment triggers the gh-aw iterate, which pushes a fix commit via `push_to_pull_request_branch`; cap stops it at 3.

## Risks & mitigations

- **gh-aw pre-1.0** → vendored + pinned v0.79.8; parked hand-rolled set is the one-revert-away fallback.
- **gh-aw custom `steps:` + create_pull_request capturing pre-agent file changes** → must verify the PR diff includes deterministic scaffolding, not just agent edits. Validate during the gh-aw compile/dry-run task before relying on it.
- **Headless deny hooks under `bypassPermissions`** → `PreToolUse` fires regardless of permission mode; mount step copies settings before the agent runs.

## Addendum (2026-06-19) — gh-aw mechanics verified against v0.79.8 source

Research against the pinned gh-aw source corrected three design assumptions; **Plan 2 reflects the verified mechanics** (see `docs/superpowers/plans/2026-06-19-ws2-3-4-ghaw-spine.md`):

- **G6 superseded:** `create-pull-request` is **commit-based**, not working-tree, and there is no literal `branch:` field. The deterministic branch name is set by the **pre-agent step** (`git checkout -b feature/issue-<N>-<slug>`); the agent commits on it; `preserve-branch-name: true` + `allowed-branches: [feature/*]` keep it exact. PR title via `title-prefix`.
- **G5 refined:** gh-aw runs the `claude` CLI under `--permission-mode acceptEdits` (not `bypassPermissions`). The PreToolUse deny hook **does execute** in this engine (proven by gh-aw's own run log), but the **primary** deterministic enforcement is gh-aw-native: `--allowed-tools`, **Protected Files** (blocks `.github/`, `.claude/`, `CLAUDE.md`, `CODEOWNERS`, manifests — basename-matched), the AWF firewall, and the architecture (the agent has **no push credentials**; only the safe-outputs job writes, to feature/PR branches, never `main`). The deny hook is a **layered** control with an empirical verify-loads step.
- **New constraint:** Protected Files is basename-matched, so the scaffold's `package.json`/`package-lock.json` must be `exclude`d on `create-pull-request`; cloned standards + mounted `.claude/` are kept out of the agent's commit via `.git/info/exclude`.

## Self-review notes

- Placeholder scan: none — every file path and behavior is concrete.
- Consistency: slug algorithm referenced once (HANDOFF §3) and reused; status.json stages match HANDOFF §5.
- Scope: this is one dependency chain producing a testable pipeline; follow-on workstreams explicitly deferred.
