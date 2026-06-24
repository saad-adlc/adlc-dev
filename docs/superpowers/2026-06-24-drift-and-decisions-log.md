# ADLC — Drift & Decisions Log

**Date:** 2026-06-24 · **Status:** living record

## Purpose

Capture where the *running* system intentionally diverges from the original design docs
(`9_ADLC_Solution.md`, early `PLAN.md`) and the decision behind each — so the divergences
read as **worked-through choices, not bugs**. Decision (2026-06-24): `9_ADLC_Solution.md`
is left **as-is** (it maps to the signed SOW); **this log is the reconciliation record**.
`PLAN.md` / `PIPELINE.md` / `INFRA-SETUP.md` were already reconciled (2026-06-22).

## Decisions & divergences

| # | Topic | Original design says | Reality / decision | Why |
|---|---|---|---|---|
| D-1 | Repo names | `orix-adlc-platform` / `orix-adlc-workspace` (9_ADLC_Solution.md) | **`adlc-standards` / `adlc-dev`** (unchanged) | The rename was scoped **out** (PLAN §1 "Out of scope") |
| D-2 | Engines | gh-aw as the orchestration spine | gh-aw **primary** + hand-rolled generate **and** iterate kept **always-wired** as backup (`ADLC_ENGINE` switch + 2-strike `adlc-failover`); **iterate not ported** to gh-aw | gh-aw strict mode bans the `contents: write` iterate's cap-3/status pushes need (D2; settled at compile, 2026-06-22) |
| D-3 | Foundry billing | `use_foundry` / `CLAUDE_CODE_USE_FOUNDRY` "when ratified" (9_ADLC_Solution.md L19/L76) | **Base-URL method** (`ANTHROPIC_BASE_URL` + `ANTHROPIC_API_KEY`), **live now** | gh-aw strict mode can't express the resource method; base-URL verified (200) |
| D-4 | create-PR identity | (unspecified) | **`ADLC_AGENT_TOKEN` (PAT)**, not `GITHUB_TOKEN` | org bars Actions from opening PRs *and* a `GITHUB_TOKEN` PR triggers no downstream CI (adlc-dev PR #35; smoke 2026-06-22) |
| D-5 | Deny-hook paths | confine writes to `workspaces/<slug>/` (relative) | hook **normalizes `$GITHUB_WORKSPACE`-absolute** Write/Edit paths + rejects `..` | Claude's Write/Edit always pass absolute paths → was denying legit in-workspace writes (adlc-standards PR #4; +7 tests, 47/47) |
| D-6 | Audit trail | "a **signed log** of agent actions" (9_ADLC_Solution.md L68) | **Deterministic `adlc-audit.yml` marker** derived from the `adlc-iterate` label + run metadata | the review agent improvised the marker format run-to-run (#40 none, #42 a different line) → determinism over model judgment |
| D-7 | Merge gate | "human approval gate required" | **Solo-safe branch protection** (require-PR / 0 approvals / enforce-admins / CodeQL `Analyze` checks / no force-push); **true approval-gating deferred** | single maintainer **is** the bot identity (`saad-vts`) — can't approve own PR + no-bypass would lock merging. Needs a **distinct bot identity** (follow-up) |
| D-8 | Required checks | CI + approval gate the merge | only **CodeQL** required so far; **`CI — Node/React` + `adlc/business-approval` deferred** | `[skip ci]` `status.json` commits move the PR head past those checks (moving-head) → would block every PR. Needs **status decoupled from the branch** first |
| D-9 | Stack | CLAUDE.md routes Angular / .NET / Java; `ai-dev/` rules (18 files) | **React + TS + Vite + Vitest only** (MVP) | multi-stack is **documented as future** (D13) — `ai-dev/` is kept intentionally, not active |
| C-1 | `copilot-setup-steps.yml` | (n/a) | **Removed 2026-06-24** | GitHub Copilot Coding Agent setup — not part of ADLC, unreferenced |

## Open follow-ups (deferred, tracked)

- **Distinct bot identity** for `ADLC_AGENT_TOKEN` → then enable required **CODEOWNERS approval** (unblocks D-7).
- **Decouple `status.json` from the PR branch** (post-PR states → a PR comment / the issue) → then add **`CI — Node/React` + `adlc/business-approval`** as required checks (unblocks D-8).
- **WS1** vendor-sync bot · **WS5** `dependabot.yml` + secret-scan push-protection · **WS7** real claude.ai run (verify MCP §C + upload `adlc-bootstrap`).
- **9_ADLC_Solution.md** stale facts (D-1, D-3, D-6) intentionally left in place; this log reconciles them.

## Validation history

doc-9 gh-aw generate proven end-to-end: hello-greeting (PR #40), portfolio dashboard stress (PR #42, zero fixes), and the in-chat user-journey dogfood (issue #45 → PR #46) — all to a live GitHub Pages preview. See `2026-06-22-ghaw-generate-smoke-outcome.md`.
