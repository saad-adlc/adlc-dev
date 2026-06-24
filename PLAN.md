# ADLC — Doc-9 Implementation Plan

> **Goal:** retrofit the existing `adlc-dev` + `adlc-standards` pipeline into the composition described in `9_ADLC_Solution.md`, leveraging what `ADLC-HANDOFF.md` already proved. This file is the *what/why/sequence*. The manual GitHub/infra steps you execute by hand live in **`INFRA-SETUP.md`**.

---

## 1. Scope (locked)
## 1. Scope (locked)

**In scope** — close the doc-9 *governance/composition* gaps on top of the working runtime spine:

- gh-aw orchestration (primary) with the hand-rolled workflows **kept always-wired** as an auto-fallback (`ADLC_ENGINE` switch + 2-strike fail-over controller)
- Spec-Kit spine in CI (full `specify → plan → tasks → implement` + `analyze` gate)
- claude-code-action as the Claude-in-CI block (it is also gh-aw's `engine: claude`)
- Deterministic `PreToolUse` deny hooks
- Sanitization gates (CodeQL + GitHub secret scanning + Dependabot)
- `no-direct-merge` enforced via branch protection + a **required `adlc/business-approval` check**
- `review-agent-governance` automated PR reviewer (informs the human gate; never approves)
- Fresh Spec-Kit **constitution + steering set** (`AGENTS.md`, `approved-stack.md`, `compliance-rules.md`)
- Vendored building blocks live in `adlc-standards`, version-pinned, with a **scheduled sync-PR bot**
- Intent capture in **claude.ai web** via a single packaged Claude **Skill** + the **GitHub MCP connector**; Claude Artifacts = pre-build preview, GitHub Pages = post-build preview
- A vendored **TDD/verification** skill from an external upstream

**Out of scope** (your call):

- The two-repo `orix-adlc-platform` / `orix-adlc-workspace` rename — we keep `adlc-standards` (source of truth) + `adlc-dev` (workspace) as-is
- `Docs/8_Solution_Roadmap_Research/`, `POC_PLAN.md`, `10_Delivery_Roadmap.md` — not produced
- Database / external integrations in generated apps (doc-9 MVP scope)

---

## 1a. Evidence baseline (verified 2026-06-16 against `saad-adlc/adlc-dev`)

> Only claims below are evidence-backed; everything else in this plan is target/aspiration until built.

- ✅ **Working today:** all 6 hand-rolled workflows run green (4 successful `Generate` runs, Jun 10–15); Foundry-billed generation; test-gate → PR with **0 of 7 PRs merged** (no auto-merge); GitHub Pages previews (`gh-pages` + `pages build` success); CodeQL scanning via GitHub **default setup**; secret scanning on (repo is **public** → free).
- ❌ **Confirmed missing:** branch protection on `main` (API returns 404 — direct push is currently possible); enforced required checks; business-approval gate; the entire doc-9 governance/composition layer.
- ⚠️ **Looks-working-but-isn't:** `adlc-security-iterate.yml` guards on `check_run.name == 'Analyze'`, but default-setup CodeQL emits `Analyze (actions)` and `Analyze (javascript-typescript)`. The guard never matches, so CodeQL→auto-iterate has **never fired** (every run `skipped`). Fix in WS5.
- ℹ️ **Old vs new:** issues/PRs #1–#19 are **old-implementation** artifacts (claude.ai chat orchestrator). They prove the CI workflows work; they say nothing about the new doc-9 intent capture, so **WS7 is net-new**, not "already working."
- 🔧 **Already done (this effort):** WS0/WS1 vendoring — building blocks pinned in `adlc-standards` (PR `adlc-standards#1`); `gh aw` extension installed and pinned to `v0.79.8`; `adlc-security-iterate` guard fixed.
- ✅ **gh-aw + Foundry verified (2026-06-18):** a gh-aw `adlc-review` workflow compiles clean, and the Foundry auth path is proven with a live 200: `ANTHROPIC_BASE_URL=https://orix-adastra-adlc.services.ai.azure.com/anthropic` + the key as the **`ANTHROPIC_API_KEY`** secret (header `x-api-key`), model `claude-sonnet-4-6`. Strict mode is satisfied (no secret in `engine.env`); gh-aw's proxy routes to the Foundry host. **The resource method (`CLAUDE_CODE_USE_FOUNDRY`) is NOT usable in gh-aw under strict mode** — base-URL is the path.
- ✅ **WS0 complete (2026-06-19):** constitution + steering set + deterministic `PreToolUse` deny hook built **TDD** on `adlc-standards@ws-doc9-standards` (**40 hook tests green**, Opus code-reviewed — 1 Critical + 5 Important fixed — PR open). The hook fails **closed** and still denies under `bypassPermissions`. `CLAUDE.md` refactored to defer (no duplicated rules). Supersedes the earlier unmerged `ws0-constitution-steering-hooks` branch. Record: `docs/superpowers/2026-06-19-ws0-completion-record.md`.

---

## 1b. Status (2026-06-19)

**Done:** vendoring (WS0/WS1 part) — PR `adlc-standards#1`; `gh aw` pinned v0.79.8; Foundry path verified; **`adlc-review` gh-aw workflow merged to `main`** (WS6 reviewer); `adlc-security-iterate` guard fixed (uncommitted); **WS0 — constitution + steering + deny hooks COMPLETE** (`adlc-standards@ws-doc9-standards`, PR open; 40 hook tests, Opus-reviewed; see `docs/superpowers/2026-06-19-ws0-completion-record.md`).

**Decisions locked (grill, 2026-06-19):** Spec-Kit depth = **structured artifacts** — the generate agent commits `spec.md`+`plan.md`+`tasks.md` + runs an analyze-style self-check, on the proven claude-code-action path (full slash-command spine deferred). Session slice = **foundation + agentic spine** (WS0 → WS4 → WS2/WS3). Design: `docs/superpowers/specs/2026-06-19-doc9-foundation-agentic-spine-design.md`.

**Remaining:**
- ~~WS0 — constitution + steering + deny hooks~~ ✅ **DONE** (`ws-doc9-standards`, PR open). The deny-hook script + `settings.template.json` exist; **mounting/wiring them into CI is WS4** (folded into Plan 2).
- ✅ **WS2/WS3/WS4 — gh-aw generate spine MERGED** (`ws-doc9-impl` → `main`): gh-aw generate + 2-strike fail-over controller + `ADLC_ENGINE` override + WS4 deny-hook mount. **Iterate stays hand-rolled** — NOT ported, because gh-aw strict mode bans the `contents: write` its deterministic cap-3 + status pushes need (would violate G8). *Pending activation:* `gh aw compile adlc-generate --approve` (lock file), set `ADLC_ENGINE`, run the T8 smoke. Plan: `docs/superpowers/plans/2026-06-19-ws2-3-4-ghaw-spine.md`.
- WS1 — vendor-sync bot
- WS5 — commit guard fix; add Dependabot + secret-scan push protection; CodeQL → required check
- WS6 — branch protection + `adlc/business-approval` required check + `CODEOWNERS`
- WS7 — packaged claude.ai Skill + MCP intent capture
- Infra — add `ANTHROPIC_API_KEY` secret (rotated key); verify MCP connector (INFRA-C)

---

## 1c. Status (2026-06-22) — gh-aw generate spine **validated live**

The gh-aw generate path passed an end-to-end smoke (issue #39 → **PR #40** → live GitHub Pages preview): engine routing (gh-aw runs, hand-rolled skips), the deny hook enforcing under Foundry, Fallback-B scaffold + `spec/plan/tasks` + TDD code in the PR, `adlc-ci` green (coverage 90.8%), preview live (HTTP 200), and the advisory governance review — all confirmed. Record: `docs/superpowers/2026-06-22-ghaw-generate-smoke-outcome.md`.

**Three fixes the smoke forced (landed on `main`):**
- `ADLC_ENGINE` repo variable was misspelled `ALDC_ENGINE` → workflows read it as unset (gh-aw ran by accident; the `=legacy` rollback was silently dead) → recreated correctly = `gh-aw`.
- gh-aw `create-pull-request` used the default `GITHUB_TOKEN` (barred from opening PRs here + triggers **no** downstream `pull_request` CI) → wired `github-token: ${{ secrets.ADLC_AGENT_TOKEN }}` — adlc-dev **PR #35**.
- deny hook denied Claude's **absolute** `Write`/`Edit` paths (the tools always pass absolute paths; the hook compared the relative `$ADLC_WORKSPACE`) → `path_outside_workspace` now strips the `$GITHUB_WORKSPACE` prefix + rejects `..` traversal — adlc-standards **PR #4**; hook suite 40→47.

**Still open:** the WS6 **audit marker** (deferred — see WS6 + §7); **T8.5** fail-over / **T8.6** engine-switch / **T8.7** iterate not yet exercised live; **branch protection (§F / WS6)** still OFF (verified 404) — the last no-direct-merge gate.

---

## 2. Decision log (from the grill)

| # | Decision | Choice |
|---|---|---|
| D1 | Orchestration substrate | **Adopt gh-aw as primary**; keep hand-rolled workflows as fallback |
| D2 | Fallback wiring | **No parking — both engines always wired**, mutually exclusive via an `ADLC_ENGINE` `if:`-guard; a plain-Actions controller auto-falls-back to hand-rolled after **2 gh-aw strikes** (or agent-BLOCKED); `ADLC_ENGINE=legacy` forces the proven path instantly |
| D3 | Spec-Kit depth | **Full spine in CI, seeded by issue-body intent**; `analyze` is a pre-PR gate; spec/plan/tasks committed as audit trail |
| D4 | Enforcement model | **bypassPermissions + hard `PreToolUse` deny hooks** (deny: push/merge to main, writes outside `workspaces/[slug]/`, secret patterns, dangerous Bash) |
| D5 | Vendor sync | **Vendored in `adlc-standards` + scheduled sync-PR bot** (fork-and-own preserved; upstream upgrades surfaced as reviewable PRs) |
| D6 | Intent runtime | **claude.ai web** (no Project); skills read from repo, not uploaded to a Project |
| D7 | Bootstrap | **One packaged Claude Skill + GitHub MCP connector** (skill reads grill-me/handoff/orchestrator from the repo, live) |
| D8 | Claude-in-CI | **Migrate to claude-code-action now** (= gh-aw `engine: claude`); the always-wired hand-rolled fallback keeps proven `claude --print` |
| D9 | Sanitization | **GitHub-native**: CodeQL (SAST, enforced) + secret scanning push-protection (enforced) + Dependabot (alerts + auto-PRs) |
| D10 | Approval gate | **Branch protection + business-approval as a required status check** + ≥1 code-owner review |
| D11 | Governance review | **Automated PR review agent that informs the human gate** (requests changes / writes signed audit entry; never approves) |
| D12 | Constitution/steering | **Author a fresh constitution + steering set**; refactor `CLAUDE.md` to defer to them |
| D13 | Approved stack | **React + TS + Vite + Vitest only** (MVP truth); multi-stack documented as future |
| D14 | TDD skill | **Vendored:** `obra/superpowers` (MIT) — `test-driven-development` + `verification-before-completion` @`8cf39006`; see `adlc-standards/VENDOR.md` |
| D15 | Deliverable | **One `PLAN.md` + one `INFRA-SETUP.md` runbook** |

---

## 3. Target architecture (after retrofit)

```
claude.ai web (business user)
  └─ packaged "ADLC" Claude Skill  ──GitHub MCP connector──▶ reads grill-me / handoff / orchestrator from repo (live)
       intent → Claude Artifacts preview → creates labelled GitHub issue
                                  │
                                  ▼  (label: adlc-generate)
adlc-standards  (read-only source of truth, vendored + pinned)         ┌─ vendor-sync bot (scheduled) → PRs on upstream change
  • constitution + steering (AGENTS.md, approved-stack, compliance)    │
  • Spec-Kit (pinned)  • gh-aw (pinned)  • review-agent-governance     │
  • grill-me / handoff / tdd-verification skills  • deny hooks ────────┘
                                  │  (cloned at CI runtime, same as today)
                                  ▼
adlc-dev  (workspace; PRs land on main, never auto-merged)
  gh-aw workflows (*.md → *.lock.yml)  [PRIMARY]        hand-rolled *.yml  [FALLBACK — always wired; ADLC_ENGINE switch + 2-strike controller]
    generate → Spec-Kit specify/plan/tasks/implement (engine: claude = claude-code-action, Foundry)
       │  deny hooks active (PreToolUse)
       ▼
    test gate (tsc+eslint+vitest≥80%) → analyze gate → open PR (safe-output, never auto-merge)
       │
       ├─ sanitization gates: CodeQL · secret-scan · Dependabot
       ├─ review-agent-governance → governance review comment + signed audit log entry
       └─ branch protection: required checks + ≥1 code-owner review + required adlc/business-approval
                                  │
                          business user approves in claude.ai → /adlc-approved → label → business-approval check passes
                                  │
                                  ▼
                          merge-eligible (human merges) → GitHub Pages preview
```

---

## 4. Workstreams

Each workstream lists: **deliverables**, **files touched**, **acceptance criteria (AC)**, and any **infra dependency** (→ a numbered step in `INFRA-SETUP.md`).

### WS0 — Vendoring foundation in `adlc-standards`  *(do first; everything pulls from here)*

**Deliverables**
- New layout under `adlc-standards/`:
  - `constitution.md` — Spec-Kit project constitution (extracted/authored from CLAUDE.md security + behavior + DoD)
  - `steering/AGENTS.md`, `steering/approved-stack.md`, `steering/compliance-rules.md`
  - `skills/grill-me/`, `skills/handoff/`, `skills/review-agent-governance/`, `skills/tdd-verification/` (vendored)
  - `vendor/spec-kit/` (pinned), `vendor/gh-aw/` (pinned), `hooks/` (deny hooks + settings template)
  - `VENDOR.md` — table of each vendored block: upstream URL, pinned tag/SHA, license, last-synced
- `CLAUDE.md` refactored to **defer** to constitution + steering (no duplicated rules)
- `approved-stack.md` declares **React+TS+Vite+Vitest only**; multi-stack marked future

**Files** `adlc-standards/*` (new tree), `adlc-standards/CLAUDE.md` (edit)

**AC** — A CI clone of `adlc-standards` exposes constitution, steering, skills, hooks, and pinned vendor dirs; `VENDOR.md` records every upstream + pin; no rule lives in two files.

---

### WS1 — Vendor-sync bot

**Deliverables**
- `adlc-standards/.github/workflows/vendor-sync.yml` — scheduled (e.g. weekly) + `workflow_dispatch`:
  - For each row in `VENDOR.md`, query the upstream for the latest release/tag
  - If newer than the pin, fetch the diff, update the vendored copy on a branch, open a PR titled `vendor-sync: <block> <old>→<new>` with the changelog/diff in the body
  - Never auto-merge — a human reviews/adapts
- Optional: label `vendor-sync` + assign to you

**Files** `adlc-standards/.github/workflows/vendor-sync.yml`, `adlc-standards/VENDOR.md`

**AC** — Manually dispatching the bot against an intentionally stale pin opens a PR with the correct diff; merging it bumps the pin in `VENDOR.md`.

**Infra dep** → INFRA step for a token the bot uses to open PRs (or default `GITHUB_TOKEN` if same-repo PRs suffice).

---

### WS2 — gh-aw adoption (primary) + engine coexistence (always-wired hand-rolled fallback)

**Deliverables**
- Install gh-aw, pin a release, vendor it (WS0). Author the orchestration as gh-aw markdown workflows in `adlc-dev/.github/workflows/*.md`, compiled to committed `*.lock.yml`:
  - `adlc-generate.md` (label `adlc-generate`) → §WS3 + WS_Spec-Kit body
  - ~~`adlc-iterate.md`~~ → **NOT ported**; iterate stays hand-rolled (`adlc-iterate.yml`), because gh-aw strict mode bans the `contents: write` its deterministic cap-3/status pushes need. It handles CI failure / review / `/adlc-iterate:` for PRs from either generator.
  - `adlc-review.md` (PR opened/updated → review-agent-governance, WS6)
  - Keep `ci` and `preview` as plain Actions (no agent) — gh-aw is for the *agentic* jobs
- gh-aw frontmatter sets `permissions: read-all` default + explicit `safe-outputs` (create-pull-request, add-comment) — this is doc-9's "read-only default + gated safe outputs". **The `create-pull-request` safe-output must set `github-token: ${{ secrets.ADLC_AGENT_TOKEN }}`** (smoke 2026-06-22): the default `GITHUB_TOKEN` is barred from opening PRs here *and* a `GITHUB_TOKEN`-opened PR triggers no downstream `pull_request` workflows (ci/review/preview). The PAT owns both the branch push and the PR API call.
- **Keep the hand-rolled workflows fully wired (NOT parked).** Make gh-aw and hand-rolled mutually exclusive via an `ADLC_ENGINE` repo-variable `if:`-guard: gh-aw runs when `ADLC_ENGINE != 'legacy'`; the hand-rolled run only when `ADLC_ENGINE == 'legacy'` (direct on label) or when the controller routes to them via the `adlc-fallback` label. No double-run; logic untouched.
- **`ADLC_ENGINE` is a real guard, not documentation**: `gh-aw` (default) = gh-aw primary + auto-fallback; `legacy` = force the proven hand-rolled path instantly (one variable flip, no workflow edits).
- **Fail-over controller** (`adlc-dev/.github/workflows/adlc-failover.yml`, plain Actions / engine-agnostic): on a gh-aw generate `workflow_run` failure, retry gh-aw once; on the **2nd strike or agent-BLOCKED**, add the `adlc-fallback` label to route to the hand-rolled generator (a real issue event → its internals are untouched). Strikes/errors propagate via a run-context artifact + structured issue comments. Detail: `docs/superpowers/plans/2026-06-19-ws2-3-4-ghaw-spine.md` (T6/T7).

**Files** new `adlc-dev/.github/workflows/*.md` + generated `*.lock.yml`; new `adlc-failover.yml`; add `ADLC_ENGINE`/`adlc-fallback` job-guards to hand-rolled `adlc-generate.yml`/`adlc-iterate.yml` (`on:` + logic untouched, **not parked**)

**AC** — With `ADLC_ENGINE` default, labelling `adlc-generate` fires **only** the gh-aw lock workflow (hand-rolled job `if:` false → skips; no double-run); flipping `ADLC_ENGINE=legacy` makes the **same label** run **only** the hand-rolled; two gh-aw failures auto-dispatch the hand-rolled generator (the controller fires only after the run concludes — never mid-pipeline); `gh aw compile` is clean and lock files committed.

**Infra dep** → INFRA steps: install `gh aw` extension; verify gh-aw runtime prerequisites; confirm `*.lock.yml` is what Actions executes.

> **Risk:** gh-aw is pre-1.0. Mitigation: vendored + pinned (no live upstream dependency); the always-wired hand-rolled set is the fallback — engaged automatically by the 2-strike controller, or instantly by flipping `ADLC_ENGINE=legacy` (no workflow edits).

---

### WS3 — claude-code-action migration (folded into WS2)

**Deliverables**
- gh-aw agentic workflows use `engine: claude` (runs claude-code-action under the hood). **Verified Foundry config** (strict-mode safe):
  ```yaml
  engine:
    id: claude
    model: claude-sonnet-4-6
    env:
      ANTHROPIC_BASE_URL: https://orix-adastra-adlc.services.ai.azure.com/anthropic
  network:
    allowed: [defaults, orix-adastra-adlc.services.ai.azure.com]
  ```
  The Foundry key is the GitHub secret **`ANTHROPIC_API_KEY`** (gh-aw auto-injects it; header `x-api-key` → 200 verified). Do **not** put the key in `engine.env` (strict mode blocks it) and do **not** use the resource method (`CLAUDE_CODE_USE_FOUNDRY`) — it can't be expressed in strict-mode gh-aw.
- Slash commands currently piped to `claude --print` (`/iterate`, `/validate-output`) become gh-aw workflow bodies or `claude_args`-mounted commands from `adlc-standards/ai-dev/workflows/`
- The always-wired hand-rolled fallback **keeps the proven `claude --print`** invocation unchanged

**Files** the gh-aw `*.md` bodies (WS2)

**AC** — A full gh-aw generate run produces code via claude-code-action, Foundry-billed (verify in Foundry usage), with identical model routing to today.

---

### WS4 — Deterministic deny hooks

**Deliverables**
- `adlc-standards/hooks/` containing a `PreToolUse` hook script + a `.claude/settings.json` template that registers it. Hook denies:
  - `git push`/`git merge`/`gh pr merge` targeting `main`
  - `Write`/`Edit` outside `workspaces/<slug>/` (and never `.github/`, root config, other workspaces)
  - secret/credential patterns in file writes (key/token/password regexes)
  - dangerous Bash (`rm -rf /`, `curl … | bash`, etc.)
- CI step (in the gh-aw generate prep, and the hand-rolled iterate's mount step) copies the hook + settings into the workdir **before** the agent runs, so `PreToolUse` fires (gh-aw runs the agent under `acceptEdits`; the hand-rolled uses `bypassPermissions` — the hook denies in both)

**Files** `adlc-standards/hooks/*`; gh-aw `*.md` (mount step)

**AC** — A deliberate test prompt that tries to write outside the workspace / push to main / write a fake secret is **blocked by the hook** (visible deny in the run log), with the rest of the run unaffected.

> **Hook fix (2026-06-22, smoke):** Claude's `Write`/`Edit` tools always pass **absolute** paths; the workspace-confinement check originally compared against the *relative* `$ADLC_WORKSPACE`, so it denied every legit in-workspace write → the agent fell back to Bash heredocs (where Claude's built-in obfuscation analysis blocked TSX/test content) → flaky/failed builds. `path_outside_workspace` now normalizes the `$GITHUB_WORKSPACE` prefix before the check and rejects `..` traversal (a real escape that was previously allowed). Hook suite 40→**47** tests. adlc-standards **PR #4**.

---

### WS5 — Sanitization gates

**Deliverables**
- **CodeQL** (SAST) — *already running* via GitHub **default setup** (verified: `Analyze (actions)` + `Analyze (javascript-typescript)` on PRs, scheduled on main). **Do not add a `codeql.yml`** (it conflicts with default setup). WS5's only CodeQL work: add these checks to required checks (§WS6/INFRA-F).
- **Fix `adlc-security-iterate.yml`** — its guard `check_run.name == 'Analyze'` never matches the default-setup names, so CodeQL→auto-iterate has never fired. Change the guard to match `Analyze (actions)` / `Analyze (javascript-typescript)` (e.g. `startsWith(github.event.check_run.name, 'Analyze')`).
- **Secret scanning** — already enabled (public repo). WS5 work: enable **push protection** (the enforced part).
- **Dependabot**: `adlc-dev/.github/dependabot.yml` for the npm ecosystem under `workspaces/` → alerts + auto-PRs (advisory, not a hard gate). Confirmed **not present** today.
- Keep the existing `adlc-ci` banned-package + coverage gates.

**Files** `adlc-dev/.github/dependabot.yml`; `adlc-dev/.github/workflows/adlc-security-iterate.yml` (guard fix). **No `codeql.yml`.**

**AC** — Pushing a test secret is blocked by push protection; a known-vuln dependency raises a Dependabot alert/PR; a CodeQL alert on a PR **now actually triggers** `adlc-security-iterate` (verify a non-`skipped` run after the guard fix).

**Infra dep** → INFRA steps: repo is **public**, so CodeQL + secret scanning are already on/free — *verify*, don't re-enable; enable secret-scanning **push protection** + Dependabot; add the CodeQL + secret-scan checks to required checks. (GHAS only matters if the repo ever goes private.)

---

### WS6 — Governance: branch protection + business-approval check + review agent

**Deliverables**
- **`review-agent-governance`** skill (WS0) + `adlc-review.md` gh-aw workflow:
  - Triggers on ADLC PR opened/synchronize
  - Reviews the diff vs `constitution.md` + `compliance-rules.md`, posts a structured governance review comment
  - Emits the audit record as a machine-readable **`<!-- adlc-audit … -->` marker in the review comment** — **not** a committed `audit.log` (strict mode forbids the agent committing files). ⚠️ **Deferred (2026-06-22 smoke):** the agent does *not* reliably emit the marker (it relied on model judgment — counter to "deterministic over model judgment"). gh-aw already appends an immutable provenance footer (workflow id, run URL, model) and the `adlc-iterate` label deterministically signals blocking-vs-advisory; the fix (accept gh-aw footers vs. a deterministic audit step) is an open follow-up — see `docs/superpowers/2026-06-22-ghaw-generate-smoke-outcome.md`.
  - May request changes (→ feeds `adlc-iterate`); **never approves**
- **Business-approval required check**: small workflow exposing commit status `adlc/business-approval` — *pending* until the `adlc-approved` label lands (set by `adlc-signals.yml`), *success* once present
- **CODEOWNERS** for `workspaces/**` so a human review is required

**Files** `adlc-standards/skills/review-agent-governance/`, `adlc-dev/.github/workflows/adlc-review.md`, a `business-approval` status workflow, `adlc-dev/.github/CODEOWNERS`

**AC** — A PR cannot merge until: all required checks pass (ci, CodeQL, secret-scan), ≥1 code-owner approves, AND `adlc/business-approval` is green; the governance review comment appears automatically (carrying gh-aw's provenance footer; the custom audit marker is a deferred follow-up); the review agent never shows as an approver. *(Review behavior + business-approval status validated 2026-06-22; branch protection itself still pending — §F.)*

**Infra dep** → INFRA steps: branch protection rule on `main` listing the exact required checks; add `adlc/business-approval` to required checks.

---

### WS7 — Intent capture (claude.ai web)

**Deliverables**
- A single thin **`ADLC` Claude Skill** uploaded to claude.ai that bootstraps: "read `skills/grill-me`, `skills/handoff`, and the orchestrator rules from `saad-adlc/adlc-dev` (or `adlc-standards`) via the GitHub MCP connector and follow them." Everything substantive stays vendored in the repo.
- Confirm `grill-me` and `handoff` skills exist in the repo (grill-me is at root today → move/copy into `adlc-standards/skills/` per WS0 so the sync-bot owns it)
- Flow: intent → Artifacts preview → create labelled issue (`adlc-generate`) → pipeline; final GitHub Pages preview surfaced back in chat (unchanged from today)
- **Live-progress monitor loop** — the skill polls an observable signal (~45s) and narrates one plain-English line per state change, ending at the clickable Pages preview. **This is what makes the pipeline "look live" in the UI** — a consumer-side property, not a CI one. Design + signal-timeline mapping: **`docs/superpowers/2026-06-19-ws7-live-ui-design.md`**. Key point: PR-open→preview liveness comes from **native GitHub events** (PR/checks/Pages) for free; only the pre-PR "generating" narration depends on WS2's live `status.json` pushes — so the live UI degrades gracefully if WS2 falls back to reduced status.

**Files** the packaged skill (uploaded to claude.ai, source kept in `adlc-standards/skills/adlc-bootstrap/`)

**AC** — From a fresh claude.ai chat (no Project), invoking the skill reads grill-me from the repo, runs the interview, renders an Artifacts preview, and opens a correctly-labelled issue whose body is a complete spec. **Live-UI AC** (see the WS7 live-UI design note): the skill narrates ≥3 distinct progress lines across a real build, surfaces the clickable preview from the authoritative `preview_url`, stops cleanly on `escalated`/`deploy-failed`, and still produces a live PR→preview progression when only native events are available.

**Infra dep** → INFRA steps: install/authorize the GitHub MCP connector on the `saad-adlc` org with write scope; upload the packaged Skill.

---

### WS8 — Orix `ai-dev/` standards integration  *(PENDING; scoped 2026-06-24)*

**Goal** Generated code follows the **Orix `ai-dev/` standards** (React style + global behavior + validation), not just the light `steering/` rules. Today the **primary gh-aw path reads only `steering/`**; only the hand-rolled fallback reads `ai-dev/` (`CLAUDE.md` + `ai-dev/rules/react/style.md`) — so the two engines drift on standards.

**Decisions (grill 2026-06-24)**
- **Package policy = enable controlled installs.** Move off the strict "no new deps": the generate flow may install the Orix-**approved** packages (`react-router-dom`, `axios`, `zustand`, `@tanstack/react-query`; `@playwright/test` for e2e) when the spec needs them. Banned list still hard-enforced (`moment`, full `lodash`, CVE, GPL).
- **Wiring = mount `ai-dev/` into gh-aw.** `adlc-prep.sh` cp's `ai-dev/` (rules/react + rules/global + validation) into the workdir; `adlc-generate.md` reads `ai-dev/rules/react/style.md` + `rules/global/*` — mirroring the hand-rolled path, so both engines read the same Orix rules.
- **Reviewer** `adlc-review` extends `compliance-rules` to check Orix style/structure (kebab-case filenames, JSDoc on public fns, ≤300 lines/file + ≤40 lines/fn, functional-only, no inline styles, API loading/error/success).
- **Output drift accepted** — generated style shifts to Orix conventions (kebab-case files, CSS Modules over inline styles).

**Open sub-questions / risks (resolve before/while building)**
- **Placeholder:** `ai-dev/rules/react/style.md` is "ADLC industry defaults *pending Orix's React standards doc*" — swap in Orix's real doc when it lands (mount/read wiring stays).
- **Controlled-install mechanism — needs a security pass.** How installs are gated: an **allow-list** (the approved table) enforced by the **deny hook** + an agent/prep `npm install <approved>` step, replacing the fixed-lockfile `npm ci`. The deny hook, banned-list, and CI gate must all still hold; the create-PR bundle must include the updated `package.json` + lockfile. Widening the agent's surface (network installs) is the main risk.
- **Source reconciliation:** `steering/approved-stack.md` (React-only) now conflicts with `ai-dev/` (+router/axios/state/query) — decide the canonical source (likely `steering/` defers to `ai-dev/`), so the agent isn't given two contradictory stack lists.

**Files** `adlc-dev/.github/scripts/adlc-prep.sh`, `adlc-dev/.github/workflows/adlc-generate.md` (+ recompile lock), `adlc-standards/steering/*` (reconcile vs `ai-dev/`), `adlc-standards/ai-dev/rules/react/style.md` (Orix swap), `adlc-dev/.github/workflows/adlc-review.md`.

**AC** A generate run reads the Orix rules, installs an approved package when the spec needs it (e.g. `react-router-dom`), emits kebab-case files + JSDoc, CI green; the reviewer flags Orix-style violations; banned packages still blocked.

---

### WS9 — Per-run budget cap  *(PENDING; scoped 2026-06-24)*

**Goal** A hard **per-run** ceiling on agent work. Today only a **daily 5000-AIC** guardrail exists (gh-aw default — `GH_AW_DEFAULT_MAX_DAILY_AI_CREDITS` is unset); there is **no per-run limit**.

**Decision (grill 2026-06-24)** Add **`engine.max-turns ≈ 50`** to `adlc-generate.md` (the supported per-run knob; ~50 is generous — a typical generate ≈ **161 AIC** and finishes well under), and **keep the daily 5000-AIC** cost ceiling. Numbers tunable after observing real runs.

**Files** `adlc-dev/.github/workflows/adlc-generate.md` (`engine.max-turns`) + recompile lock; consider matching `--max-turns` on the hand-rolled path.

**AC** A run that loops past ~50 turns is stopped (visible in the run log); normal runs unaffected; the daily cap is unchanged.

**Open** Verify gh-aw exposes `engine.max-turns` (claude-code-action passthrough); if a **per-run AIC** cap is also supported, consider adding it alongside.

---

## 5. Sequencing & dependencies

```
WS0 (vendoring foundation) ─┬─▶ WS1 (sync bot)
                            ├─▶ WS2 (gh-aw + engine coexistence) ──▶ WS3 (claude-code-action, folded in)
                            ├─▶ WS4 (deny hooks)        ┐
                            ├─▶ WS6 (review agent)      ├─ depend on WS2 workflows existing
                            └─▶ WS7 (intent skill)
WS5 (sanitization) ── mostly infra, can run in parallel after WS0
Spec-Kit spine (D3) ── authored inside WS2's adlc-generate.md body, uses WS0 constitution
```

**Recommended order:** WS0 → WS5 (infra-heavy, parallelizable) → WS2/WS3 → WS4 → WS6 → WS7 → WS1.
Branch protection (WS6 infra) goes **last among gates** so it doesn't block your own setup commits.

---

## 6. Acceptance — end-to-end definition of done

A new feature, driven entirely from a fresh claude.ai chat, results in:
1. Interview via vendored grill-me (read from repo), Artifacts preview, labelled issue.
2. gh-aw generate runs Spec-Kit `specify→plan→tasks→implement` via claude-code-action (Foundry), deny hooks active, `analyze` gate passes, spec/plan/tasks committed.
3. PR opened (never auto-merged); ci + CodeQL + secret-scan green; Dependabot clean.
4. review-agent-governance posts a governance review + signed audit entry; never approves.
5. Merge blocked until ≥1 code-owner review **and** `adlc/business-approval` (business sign-off via `/adlc-approved`).
6. After human merge, GitHub Pages preview is surfaced back in chat.
7. The always-wired hand-rolled fallback takes over if gh-aw misbehaves — automatically after 2 strikes (controller), or instantly via `ADLC_ENGINE=legacy` — with no workflow edits.

---

## 7. Open items

- ~~**TDD/verification upstream (D14)**~~ — **resolved:** vendored `obra/superpowers` (MIT) `test-driven-development` + `verification-before-completion` @`8cf39006`; recorded in `adlc-standards/VENDOR.md`.
- **`adlc-security-iterate` guard bug (from evidence):** fix the `check_run.name == 'Analyze'` mismatch (WS5) — currently dead. This is the one "thought-it-worked" item the evidence exposed.
- **Secret name drift:** `ADLC-HANDOFF.md` lists `ANTHROPIC_API_KEY`/`ADLC_PAT`/`GH_TOKEN`; the live workflows use `ADLC_AGENT_TOKEN` + `CLAUDE_API_KEY`. `INFRA-SETUP.md` uses the live names.
- **MCP connector state unverified:** treat connector install (INFRA-C) as a real pending step until a live read+write test from claude.ai passes.
- **Audit marker (WS6) — deferred (2026-06-22):** the governance reviewer omits the `<!-- adlc-audit … -->` JSON because it depended on the agent emitting it. Decide: accept gh-aw's immutable footers as the audit trail, or add a deterministic audit step keyed off the `adlc-iterate` label + run metadata. (Leaning: gh-aw footers + the label already give deterministic provenance.)
- **Live activation remaining:** **T8.5** 2-strike fail-over, **T8.6** engine switch (`ADLC_ENGINE=legacy`), **T8.7** iterate loop — not yet exercised live; **branch protection (§F)** still OFF (verified 404).
- **Smoke validated (2026-06-22):** gh-aw generate happy-path proven end-to-end (issue #39 → PR #40 → live preview); 3 fixes landed (engine var, create-PR PAT, hook abspath). See §1c + `docs/superpowers/2026-06-22-ghaw-generate-smoke-outcome.md`.
- **WS8 + WS9 (scoped 2026-06-24, PENDING):** integrate the **Orix `ai-dev/` standards** into the primary gh-aw path (controlled package installs + mount `ai-dev/` + reviewer checks) and add a **per-run `max-turns ≈ 50`** cap. See §4 WS8/WS9 + `docs/superpowers/2026-06-24-drift-and-decisions-log.md`.
```
