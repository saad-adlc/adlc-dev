# ADLC — Doc-9 Implementation Plan

> **Goal:** retrofit the existing `adlc-dev` + `adlc-standards` pipeline into the composition described in `9_ADLC_Solution.md`, leveraging what `ADLC-HANDOFF.md` already proved. This file is the *what/why/sequence*. The manual GitHub/infra steps you execute by hand live in **`INFRA-SETUP.md`**.

---

## 1. Scope (locked)
## 1. Scope (locked)

**In scope** — close the doc-9 *governance/composition* gaps on top of the working runtime spine:

- gh-aw orchestration (primary) with the hand-rolled workflows parked as fallback
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
- **WS2/WS3/WS4 — port generate + iterate to gh-aw + mount deny hooks** *(Plan 2 — drafting next; `adlc-dev@ws-doc9-impl`). Decision resolved: port **both** to gh-aw now.*
- WS1 — vendor-sync bot
- WS5 — commit guard fix; add Dependabot + secret-scan push protection; CodeQL → required check
- WS6 — branch protection + `adlc/business-approval` required check + `CODEOWNERS`
- WS7 — packaged claude.ai Skill + MCP intent capture
- Infra — add `ANTHROPIC_API_KEY` secret (rotated key); verify MCP connector (INFRA-C)

---

## 2. Decision log (from the grill)

| # | Decision | Choice |
|---|---|---|
| D1 | Orchestration substrate | **Adopt gh-aw as primary**; keep hand-rolled workflows as fallback |
| D2 | Fallback wiring | **Park hand-rolled on `workflow_dispatch`-only**; gh-aw owns the real triggers |
| D3 | Spec-Kit depth | **Full spine in CI, seeded by issue-body intent**; `analyze` is a pre-PR gate; spec/plan/tasks committed as audit trail |
| D4 | Enforcement model | **bypassPermissions + hard `PreToolUse` deny hooks** (deny: push/merge to main, writes outside `workspaces/[slug]/`, secret patterns, dangerous Bash) |
| D5 | Vendor sync | **Vendored in `adlc-standards` + scheduled sync-PR bot** (fork-and-own preserved; upstream upgrades surfaced as reviewable PRs) |
| D6 | Intent runtime | **claude.ai web** (no Project); skills read from repo, not uploaded to a Project |
| D7 | Bootstrap | **One packaged Claude Skill + GitHub MCP connector** (skill reads grill-me/handoff/orchestrator from the repo, live) |
| D8 | Claude-in-CI | **Migrate to claude-code-action now** (= gh-aw `engine: claude`); parked fallback keeps proven `claude --print` |
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
  gh-aw workflows (*.md → *.lock.yml)  [PRIMARY]        hand-rolled *.yml  [FALLBACK, workflow_dispatch-only]
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

### WS2 — gh-aw adoption (primary) + park hand-rolled (fallback)

**Deliverables**
- Install gh-aw, pin a release, vendor it (WS0). Author the orchestration as gh-aw markdown workflows in `adlc-dev/.github/workflows/*.md`, compiled to committed `*.lock.yml`:
  - `adlc-generate.md` (label `adlc-generate`) → §WS3 + WS_Spec-Kit body
  - `adlc-iterate.md` (CI failure / review / `/adlc-iterate:` comment)
  - `adlc-review.md` (PR opened/updated → review-agent-governance, WS6)
  - Keep `ci` and `preview` as plain Actions (no agent) — gh-aw is for the *agentic* jobs
- gh-aw frontmatter sets `permissions: read-all` default + explicit `safe-outputs` (create-pull-request, add-comment) — this is doc-9's "read-only default + gated safe outputs"
- **Park the 6 existing hand-rolled workflows**: change each `on:` to `workflow_dispatch` only (logic untouched). They remain the one-edit-away fallback.
- Add repo variable `ADLC_ENGINE` (documentation/runbook switch) — value `gh-aw` in normal operation; flipping triggers back is the documented fallback procedure.

**Files** new `adlc-dev/.github/workflows/*.md` + generated `*.lock.yml`; edit `on:` blocks of existing 6 `*.yml`

**AC** — Labelling an issue `adlc-generate` fires **only** the gh-aw lock workflow (no double-run); the parked hand-rolled `adlc-generate.yml` runs only via manual dispatch; `gh aw compile` is clean and lock files are committed.

**Infra dep** → INFRA steps: install `gh aw` extension; verify gh-aw runtime prerequisites; confirm `*.lock.yml` is what Actions executes.

> **Risk:** gh-aw is pre-1.0. Mitigation: vendored + pinned (no live upstream dependency); fallback is the parked hand-rolled set, restored by reverting `on:` blocks.

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
- Parked fallback workflows **keep the proven `claude --print`** invocation unchanged

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
- CI step (in gh-aw generate/iterate) copies the hook + settings into the workdir **before** the agent runs, so `PreToolUse` fires even under `bypassPermissions`

**Files** `adlc-standards/hooks/*`; gh-aw `*.md` (mount step)

**AC** — A deliberate test prompt that tries to write outside the workspace / push to main / write a fake secret is **blocked by the hook** (visible deny in the run log), with the rest of the run unaffected.

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
  - Writes a **signed audit-log entry** (git-tracked, e.g. `workspaces/<slug>/.adlc/audit.log` or a JSONL) attributing the agent action
  - May request changes (→ feeds `adlc-iterate`); **never approves**
- **Business-approval required check**: small workflow exposing commit status `adlc/business-approval` — *pending* until the `adlc-approved` label lands (set by `adlc-signals.yml`), *success* once present
- **CODEOWNERS** for `workspaces/**` so a human review is required

**Files** `adlc-standards/skills/review-agent-governance/`, `adlc-dev/.github/workflows/adlc-review.md`, a `business-approval` status workflow, `adlc-dev/.github/CODEOWNERS`

**AC** — A PR cannot merge until: all required checks pass (ci, CodeQL, secret-scan), ≥1 code-owner approves, AND `adlc/business-approval` is green; the governance review comment + audit entry appear automatically; the review agent never shows as an approver.

**Infra dep** → INFRA steps: branch protection rule on `main` listing the exact required checks; add `adlc/business-approval` to required checks.

---

### WS7 — Intent capture (claude.ai web)

**Deliverables**
- A single thin **`ADLC` Claude Skill** uploaded to claude.ai that bootstraps: "read `skills/grill-me`, `skills/handoff`, and the orchestrator rules from `saad-adlc/adlc-dev` (or `adlc-standards`) via the GitHub MCP connector and follow them." Everything substantive stays vendored in the repo.
- Confirm `grill-me` and `handoff` skills exist in the repo (grill-me is at root today → move/copy into `adlc-standards/skills/` per WS0 so the sync-bot owns it)
- Flow: intent → Artifacts preview → create labelled issue (`adlc-generate`) → pipeline; final GitHub Pages preview surfaced back in chat (unchanged from today)

**Files** the packaged skill (uploaded to claude.ai, source kept in `adlc-standards/skills/adlc-bootstrap/`)

**AC** — From a fresh claude.ai chat (no Project), invoking the skill reads grill-me from the repo, runs the interview, renders an Artifacts preview, and opens a correctly-labelled issue whose body is a complete spec.

**Infra dep** → INFRA steps: install/authorize the GitHub MCP connector on the `saad-adlc` org with write scope; upload the packaged Skill.

---

## 5. Sequencing & dependencies

```
WS0 (vendoring foundation) ─┬─▶ WS1 (sync bot)
                            ├─▶ WS2 (gh-aw + park fallback) ──▶ WS3 (claude-code-action, folded in)
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
7. Parked hand-rolled workflows restore the whole pipeline via reverting `on:` blocks if gh-aw misbehaves.

---

## 7. Open items

- ~~**TDD/verification upstream (D14)**~~ — **resolved:** vendored `obra/superpowers` (MIT) `test-driven-development` + `verification-before-completion` @`8cf39006`; recorded in `adlc-standards/VENDOR.md`.
- **`adlc-security-iterate` guard bug (from evidence):** fix the `check_run.name == 'Analyze'` mismatch (WS5) — currently dead. This is the one "thought-it-worked" item the evidence exposed.
- **Secret name drift:** `ADLC-HANDOFF.md` lists `ANTHROPIC_API_KEY`/`ADLC_PAT`/`GH_TOKEN`; the live workflows use `ADLC_AGENT_TOKEN` + `CLAUDE_API_KEY`. `INFRA-SETUP.md` uses the live names.
- **MCP connector state unverified:** treat connector install (INFRA-C) as a real pending step until a live read+write test from claude.ai passes.
```
