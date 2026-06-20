# ADLC Pipeline — GitHub Actions & YAML

How a plain-language feature request becomes a reviewed, gated pull request.
Stage tags reflect verified status (2026-06-16): **✅ working today · 🔜 planned (WS#) · ⚠️ needs fix**.

```mermaid
flowchart TD
  subgraph GEN["adlc-generate.yml"]
    SCAF["Scaffold branch and workspace"]
    CODE["Generate: Spec-Kit, Claude Code on Foundry, deny hooks"]
    PR["Open PR to main"]
    SCAF --> CODE --> PR
  end

  subgraph GATE["PR gate"]
    CQ["CodeQL (default setup)"]
    SEC["Secret scan and Dependabot"]
    GOV["adlc-review: governance review"]
  end

  U["Business user (claude.ai web)"] --> ISS["Issue labelled adlc-generate"]
  ISS --> SCAF

  PR --> CI["adlc-ci.yml: typecheck, lint, tests 80pct min"]
  PR --> CQ
  PR --> SEC
  PR --> GOV

  CI --> Q{"All checks green?"}
  CQ --> Q
  SEC --> Q
  GOV --> Q

  CQ -. alert .-> SECIT["adlc-security-iterate.yml: fix CodeQL alert"]
  SECIT --> CI

  Q -- no --> ITER["adlc-iterate.yml: auto-iterate, max 3"]
  ITER --> CI
  ITER -. 3 fails .-> ESC["Escalate to chat"]

  Q -- yes --> PREV["adlc-preview.yml: deploy to GitHub Pages"]
  PREV --> APPR["adlc-signals.yml: applies adlc-approved label"]
  APPR --> MERGE["Merge to main, gated"]
```

*Legend: `*.yml` = hand-rolled workflow (working today) · `adlc-review` = gh-aw (planned) · CodeQL and Secret scan + Dependabot = GitHub-native.*

## Intent capture (claude.ai web) — 🔜 WS7

A business user works in claude.ai web. A single packaged **ADLC Skill** bootstraps the session: via the **GitHub MCP connector** it reads the vendored `grill-me` and `handoff` skills live from the repo and follows them. grill-me runs the interview; a **Claude Artifacts** preview shows the proposed app before any build; on confirmation it creates a GitHub issue labelled **`adlc-generate`** whose body is the full spec.

## adlc-generate (Phases 3–7)

Orchestrated by the **gh-aw** `adlc-generate.lock.yml` (primary); the hand-rolled `adlc-generate.yml` is parked on `workflow_dispatch` as a fallback.

- **Phase 3 — Scaffold** ✅ The `adlc-generate` label is the trigger. Creates `workspaces/<slug>/`, the `feature/issue-<N>-<slug>` branch, and `status.json` (the channel the chat side reads).
- **Phases 4–6 — Generate** 🔜 WS2–WS4. One atomic CI job run by **claude-code-action** (`engine: claude`, `use_foundry`) on Azure AI Foundry (`claude-sonnet-4-6` / `claude-opus-4-8`). Before the agent starts, **deterministic `PreToolUse` deny hooks** are mounted (no writes outside `workspaces/<slug>/`, no push/merge to `main`, no secrets, no dangerous Bash) and fire even under `bypassPermissions`. The agent follows the **Spec-Kit spine** seeded by the issue intent — `constitution → specify → plan → tasks → implement` — committing `spec.md`/`plan.md`/`tasks.md` as the audit trail, writing **tests first** (vendored `tdd-verification` skill), then validating (`npm run ci`) and passing the **`/speckit.analyze`** quality gate.
- **Phase 7 — Open PR** ✅ Opens `feature/...` → `main` as a gh-aw **safe output**. Status → `pr-open`. Never auto-merged.

## PR gate

Triggered when the PR opens:

- **CI** ✅ `adlc-ci` runs `tsc --noEmit` + `eslint` + `vitest --coverage` (80% min) + a banned-package check.
- **CodeQL** ✅ runs via GitHub **default setup** — checks `Analyze (actions)` and `Analyze (javascript-typescript)`. (No `codeql.yml` in the repo, and none should be added.)
- **Secret scanning + Dependabot** 🔜 WS5. Secret-scanning push protection blocks secrets at push time; Dependabot raises dependency alerts/PRs.
- **Governance review** 🔜 WS6. An `adlc-review` gh-aw workflow runs `review-agent-governance`: reviews the diff against the constitution + compliance rules, posts a structured review, writes a signed audit-log entry, and may request changes — but **never approves**.

## Phase 8 — Auto-iterate ✅ (security loop ⚠️ WS5)

CI failure, a changes-requested review, or a **`/adlc-iterate:`** PR comment re-invokes Claude Code with the failure context. Up to **3** attempts; each is a fresh CI run; hitting the cap **escalates to chat**.
⚠️ The CodeQL remediation loop (`adlc-security-iterate.yml`) guards on `check_run.name == 'Analyze'`, which never matches the default-setup check names — so it has never fired (all runs `skipped`). WS5 changes the guard to `startsWith(github.event.check_run.name, 'Analyze')`.

## Phase 9 — Deploy preview ✅

On `adlc-ci` success (`workflow_run`), `adlc-preview.yml` builds the changed workspace, publishes it to **GitHub Pages** at `previews/pr-<N>-<slug>/`, posts the URL as a PR comment, and sets status `preview-deployed`. A `deploy-failed` is flagged for a human and never auto-iterated.

## Phase 10 — Review + gated merge 🔜 WS6

The business user opens the live preview from claude.ai. Approval posts **`/adlc-approved:`**, which `adlc-signals.yml` turns into the `adlc-approved` label, flipping the required **`adlc/business-approval`** check green. Small changes loop back via `/adlc-iterate:`; spec-level changes trigger SPEC ROLLBACK.
A branch-protection rule on `main` blocks merge until **all required checks pass + at least 1 CODEOWNERS review + `adlc/business-approval` is green**, and forbids direct pushes. A human performs the merge — nothing auto-merges.

## Orchestration & fallback

gh-aw compiled `*.lock.yml` workflows are primary; the six hand-rolled `*.yml` workflows are parked on `workflow_dispatch`. If gh-aw misbehaves, revert their `on:` blocks to the real triggers and disable the lock workflows — the proven `claude --print` pipeline takes over with no double-runs (see `INFRA-SETUP.md` §L).
