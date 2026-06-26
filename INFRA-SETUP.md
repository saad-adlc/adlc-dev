# ADLC — Infra Setup Runbook

> 🧭 **Migrating to a clean org (e.g. `orix`)?** Use **`MIGRATION-RUNBOOK.md`** — it consolidates this file plus WS10 (the merge gate), WS11 (metrics / ADX), and the owner-rename + lock-recompile step a plain clone misses. This file remains the in-place `saad-adlc` reference.

> Manual, click-and-paste steps **you** perform (GitHub settings, secrets, claude.ai, local CLI). Companion to `PLAN.md`. Steps are grouped and ordered; each ends with a **Verify** line. Org/repo: `saad-adlc/adlc-dev` (workspace) + `saad-adlc/adlc-standards` (source of truth).

**Legend:** 🖱️ = GitHub web UI · 💻 = terminal (run from the repo) · ☁️ = claude.ai web.

---

## A. Prerequisites & accounts

1. 💻 Confirm CLI tooling:
   ```bash
   gh --version            # GitHub CLI
   gh auth status          # logged in as a user with admin on saad-adlc
   node --version          # v20.x
   git --version
   ```
2. 🖱️ Confirm you have **admin** on both `saad-adlc/adlc-dev` and `saad-adlc/adlc-standards` (Settings tab must be visible).

**Verify:** `gh auth status` shows the `saad-adlc` org and admin scope.

---

## B. Secrets & variables (both repos as noted)

> Live secret names in the current workflows are **`ADLC_AGENT_TOKEN`** and **`CLAUDE_API_KEY`** — keep these names.

3. 🖱️ `adlc-dev` → Settings → Secrets and variables → Actions → **Secrets**. Confirm/create:
   - `ADLC_AGENT_TOKEN` — fine-grained PAT (or GitHub App token) with, on `saad-adlc/adlc-dev`: **Contents: RW, Pull requests: RW, Issues: RW, Pages: RW, Workflows: RW**, and on `saad-adlc/adlc-standards`: **Contents: R** (it gets cloned each run). **(2026-06-22) the gh-aw `adlc-generate` `create-pull-request` safe-output uses this PAT** as its `github-token`, so the PR opens under a real identity and triggers downstream CI/review/preview — the default `GITHUB_TOKEN` cannot (see §E).
   - `CLAUDE_API_KEY` — the Azure AI Foundry key, used by the **hand-rolled** workflows (resource method: `CLAUDE_CODE_USE_FOUNDRY` + `ANTHROPIC_FOUNDRY_API_KEY`).
   - `ANTHROPIC_API_KEY` — **for the gh-aw path**: same Foundry key value, under this name (gh-aw auto-injects it into the claude engine). Verified: with `ANTHROPIC_BASE_URL=https://orix-adastra-adlc.services.ai.azure.com/anthropic`, header `x-api-key` returns 200 for model `claude-sonnet-4-6`. gh-aw strict mode forbids the key in `engine.env`, so it must be this secret.
4. 🖱️ `adlc-dev` → Settings → Secrets and variables → Actions → **Variables**. Create:
   - `ADLC_ENGINE` = `gh-aw`  *(real `if:`-guard switching the active engine: `gh-aw` = primary + auto-fallback; `legacy` = force the hand-rolled path. See §E / §L.)*
     - ⚠️ **Spell it EXACTLY `ADLC_ENGINE`.** A misspelling (we hit `ALDC_ENGINE` on 2026-06-22) makes every workflow read `vars.ADLC_ENGINE` as unset → gh-aw runs "by accident" **and the `=legacy` rollback silently does nothing**. Verify: `gh variable list -R saad-adlc/adlc-dev` shows exactly one `ADLC_ENGINE`.
5. 🖱️ `adlc-standards` → Settings → Secrets → add `ADLC_AGENT_TOKEN` (same PAT) so the **vendor-sync bot** can open PRs there.

**Verify:** both secrets present in `adlc-dev`; `ADLC_ENGINE` variable visible; `adlc-standards` has the token.

---

## C. GitHub MCP connector (for claude.ai intent capture)

> **Status: NOT YET VERIFIED — treat as a required step.** The old-implementation issues/PRs do not prove this is installed for the new flow. Run the **Verify** test below before relying on claude.ai intent capture; if it already works, this collapses to a quick confirm.

6. ☁️ claude.ai → Settings → Connectors → **GitHub** → Connect. Authorize.
7. 🖱️ Install the connector's **GitHub App on the `saad-adlc` org** (not just your personal account) with repo **read + write** scope on `adlc-dev` (and read on `adlc-standards`).
   - *(Per `ADLC-HANDOFF.md` §7: write ops need the App installed on the **org**; a 403 "Resource not accessible by integration" = App not installed with scope, not a collaborator issue.)*
8. ☁️ If you changed App permissions, do a full **disconnect → reconnect** in claude.ai to mint a fresh token (adjusting scopes does **not** upgrade the active token).

**Verify:** in a claude.ai chat, ask it to read `README.md` from `saad-adlc/adlc-dev` via the connector **and** to create a test label — both succeed.

---

## D. Vendor & pin the building blocks (local, then push to `adlc-standards`)

> **✅ DONE (2026-06-16)** — branch `vendor/doc9-building-blocks`, PR **`adlc-standards#1`**. Pins: spec-kit `v0.10.3`, gh-aw `v0.79.8`, grill-me + handoff `mattpocock/skills@694fa303`, tdd-verification `obra/superpowers@8cf39006`; review-agent-governance authored in-house. `gh aw` extension installed `--pin v0.79.8`. Steps below retained for reproducibility / re-vendoring.

9. 💻 In `adlc-standards`, create the vendoring layout and `VENDOR.md` (upstream URL, pinned tag/SHA, license, last-synced per block: spec-kit, gh-aw, grill-me, handoff, review-agent-governance, tdd-verification).
10. 💻 Install the gh-aw CLI extension and confirm the pinned version (repo is **`github/gh-aw`**, moved from `githubnext/gh-aw`):
    ```bash
    gh extension install github/gh-aw --pin v0.79.8
    gh aw version   # -> v0.79.8
    ```
11. 💻 Vendor Spec-Kit and gh-aw at a **specific tag** into `adlc-standards/vendor/` (record the tag in `VENDOR.md`). Do **not** depend on `@latest` at runtime.
12. 💻 Pick & vendor the **TDD/verification** upstream skill once confirmed (PLAN §7 open item): verify its license is MIT/permissive and it's maintained, then copy into `adlc-standards/skills/tdd-verification/` and record the pin.

**Verify:** `VENDOR.md` lists every block with a concrete pin + license; no block references a moving `latest`.

---

## E. gh-aw workflows + engine coexistence (always-wired hand-rolled fallback, in `adlc-dev`)

> **Model:** gh-aw is primary; the hand-rolled `*.yml` stay **fully wired as an always-ready fallback (never parked)**. gh-aw and hand-rolled are mutually exclusive via an `ADLC_ENGINE` repo-variable `if:`-guard, and a plain-Actions controller (`adlc-failover.yml`) auto-falls-back after 2 gh-aw strikes. Detail: PLAN WS2 + `docs/superpowers/plans/2026-06-19-ws2-3-4-ghaw-spine.md` (T6/T7).

13. ✅ **Done:** `gh aw init` run; `adlc-review.md` + `.lock.yml` committed and **merged to `main`**. Additive governance gate — no engine guard needed. Needs the `ANTHROPIC_API_KEY` secret (§B).
14. ✅ **Done + validated (2026-06-22, PR #35):** the gh-aw generate port landed with coexistence wired (do **NOT** park):
    - gh-aw `adlc-generate.md`: `if: vars.ADLC_ENGINE != 'legacy'`. (Iterate is **NOT** ported — strict mode bans its `contents: write`; `adlc-iterate.yml` stays hand-rolled, always active, no guard.)
    - gh-aw `adlc-generate.md` `safe-outputs.create-pull-request`: **`github-token: ${{ secrets.ADLC_AGENT_TOKEN }}`** — REQUIRED. With the default `GITHUB_TOKEN` the org bars PR creation *and* the opened PR triggers no downstream `pull_request` workflows; the PAT fixes both (it owns the branch push **and** the PR API call). Found via the smoke; see `docs/superpowers/2026-06-22-ghaw-generate-smoke-outcome.md`.
    - hand-rolled `adlc-generate.yml`: gate the `generate` job to `github.event.label.name == 'adlc-fallback' || (github.event.label.name == 'adlc-generate' && vars.ADLC_ENGINE == 'legacy')`. hand-rolled `adlc-iterate.yml`: wrap its compound job `if:` with `vars.ADLC_ENGINE == 'legacy' && ( … )`. `on:` + logic untouched.
    - add `adlc-failover.yml` (the 2-strike controller; routes to hand-rolled via the `adlc-fallback` label, which it creates if missing).
    - `adlc-ci.yml`, `adlc-preview.yml`, `adlc-security-iterate.yml`, `adlc-signals.yml` → keep as real Actions (not agentic; not engine-switched).

**Verify:** with `ADLC_ENGINE` unset/`gh-aw`, labelling `adlc-generate` runs **only** the gh-aw lock workflow (hand-rolled job skips); setting `ADLC_ENGINE=legacy` makes the **same label** run **only** the hand-rolled; no event runs both (no double-run).

---

## F. Branch protection & required checks (the no-direct-merge gate)

> Do this **after** the gate-producing workflows exist and have run once (so their check names appear in the dropdown).
>
> **Status (2026-06-22): still OFF** — `gh api repos/saad-adlc/adlc-dev/branches/main/protection` returns 404. This is the **last remaining no-direct-merge gate**. The gate checks now exist and have run live (smoke PR #40: `CI — Node/React`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `adlc/business-approval`), so their names are selectable. Until this is on, `main` accepts direct pushes.

15. 🖱️ `adlc-dev` → Settings → Branches → Add branch ruleset (or classic protection) for `main`:
    - ✅ Require a pull request before merging
    - ✅ Require **≥1 approval**; ✅ Require review from **Code Owners**
    - ✅ Dismiss stale approvals on new commits
    - ✅ Require **status checks to pass**, and select: `CI — Node/React` (the `adlc-ci` job name), the CodeQL checks **`Analyze (actions)`** + **`Analyze (javascript-typescript)`** (verified default-setup names), and **`adlc/business-approval`** (produced by `adlc-business-approval.yml`, WS6 — add it only after it has posted once; see §K / Task 6). *(Secret-scanning push protection is not a PR status check — see §G.)*
    - ✅ Require branches up to date before merging
    - ✅ Block force pushes; ✅ Restrict deletions
    - ✅ Do **not** allow bypassing (or restrict bypass to nobody) — including admins, to honor no-direct-merge
16. ✅ `adlc-dev/.github/CODEOWNERS` exists — `workspaces/** @saad-vts` (WS6). Confirm `@saad-vts` has write access so the "Require review from Code Owners" requirement resolves. (To use a team instead, edit the one line.)

**Verify:** open a throwaway PR — GitHub shows it **blocked** on missing approval + `adlc/business-approval` even when CI is green; direct push to `main` is rejected.

---

## G. Sanitization (GitHub-native)

> **This repo is currently public** → CodeQL + secret scanning are free and **already active** (verified 2026-06-16). Only if the repo ever goes private will these need GitHub Advanced Security.

17. 🖱️ `adlc-dev` → Settings → Code security:
    - **CodeQL / Code scanning** → already on via **default setup** (verified: `Analyze (actions)` + `Analyze (javascript-typescript)` run on PRs). Just confirm — **do not add a `codeql.yml`** (it conflicts with default setup).
    - **Secret scanning** → already on (public repo). Enable **Push protection** (the enforced part).
    - **Dependabot** → Enable alerts + security updates (currently off).
    - **Fix the dead loop:** `adlc-security-iterate.yml` guards on `check_run.name == 'Analyze'`, which never matches the names above, so every run is `skipped`. Change the guard to `startsWith(github.event.check_run.name, 'Analyze')` (PLAN WS5) so CodeQL alerts actually trigger remediation.
18. 💻 Add `adlc-dev/.github/dependabot.yml` for the npm ecosystem scoped to `workspaces/` (directory globbing), commit it.
19. 🖱️ Ensure the CodeQL checks (`Analyze (actions)`, `Analyze (javascript-typescript)`) are in the **required checks** list from step 15. (Secret-scanning push protection blocks pushes directly — it is **not** a PR status check, so it won't appear there.)

**Verify:** push a dummy `AKIA…`-style string on a test branch → push protection blocks it; introduce a known-vuln dep → Dependabot opens an alert/PR; **after the guard fix**, a CodeQL alert on a PR triggers a **non-`skipped`** `adlc-security-iterate` run.

---

## H. GitHub Pages (preview hosting — already in use)

20. 🖱️ `adlc-dev` → Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / root (the preview workflow publishes here).

**Verify:** an existing `previews/pr-*/` path loads at `https://saad-adlc.github.io/adlc-dev/previews/...`.

---

## I. Packaged Claude Skill (intent bootstrap)

21. 💻 Keep the skill source in `adlc-standards/skills/adlc-bootstrap/` (so the sync-bot owns it). The skill body: "Using the GitHub MCP connector, read `skills/grill-me`, `skills/handoff`, and the orchestrator rules from `saad-adlc/adlc-dev`; follow them to interview, preview via Artifacts, and open a labelled `adlc-generate` issue."
22. ☁️ Upload that skill to claude.ai as a **Skill** (not a Project): claude.ai → Skills → Create/Upload.

**Verify:** a fresh claude.ai chat (no Project) + the skill → produces a grill-me interview, an Artifacts preview, and a correctly-labelled issue whose body is a full spec.

---

## J. Vendor-sync bot

23. 💻 Add `adlc-standards/.github/workflows/vendor-sync.yml` (scheduled weekly + `workflow_dispatch`) that, per `VENDOR.md` row, checks the upstream for a newer release and opens a PR with the diff. Uses `ADLC_AGENT_TOKEN`.
24. 🖱️ `adlc-standards` → Settings → Actions → General → ensure **"Allow GitHub Actions to create and approve pull requests"** is enabled (needed for the bot to open PRs). *(Not required if the bot opens PRs via `ADLC_AGENT_TOKEN` (a PAT, per step 23) instead of the default `GITHUB_TOKEN` — same lesson as adlc-dev's generate path, smoke 2026-06-22. A PAT-opened PR also triggers the bot's reviewers; a `GITHUB_TOKEN` one would not.)*

**Verify:** temporarily set one pin in `VENDOR.md` to an older tag, dispatch the bot → it opens a `vendor-sync:` PR with the correct diff.

---

## K. Smoke test (full loop)

> **Status (2026-06-22): the CI-side loop PASSED end-to-end.** Driven by labelling an issue directly (the claude.ai front-end is WS7, not built yet): issue #39 → gh-aw generate (Foundry) → deny hook enforcing → Spec-Kit artifacts + TDD code → **PR #40 opened under the PAT** → `adlc-ci` green (coverage 90.8%) → **live Pages preview (HTTP 200)** → advisory governance review. Three fixes were required first — engine-var spelling (§B), create-PR `github-token` PAT (§E), deny-hook absolute-path (adlc-standards PR #4) — all landed. Full record: `docs/superpowers/2026-06-22-ghaw-generate-smoke-outcome.md`. **Remaining for the *full* loop:** WS7 intent capture (steps 25/27 below), and business-approval → human merge gated by branch protection (§F).

25. ☁️ From a fresh claude.ai chat, run the ADLC skill end-to-end on a trivial feature (e.g. "hello world greeting").
26. 🖱️ Watch: issue created → gh-aw generate runs (claude-code-action, Foundry) → deny hooks active in logs → Spec-Kit artifacts committed → PR opened (not merged) → ci/CodeQL/secret-scan green → governance review comment + audit entry → PR blocked on approval + `adlc/business-approval`.
27. ☁️ Approve in chat (`/adlc-approved`) → business-approval check goes green → merge as a human → Pages preview surfaced.

**Verify:** every gate behaved as in PLAN §6; Foundry usage shows the spend.

---

## L. Fallback procedure (if gh-aw misbehaves)

28. 💻 **Force the hand-rolled engine:** set the repo variable **`ADLC_ENGINE = legacy`** — one flip, no workflow edits. The gh-aw workflows then skip (their `if: != 'legacy'` is false) and the hand-rolled run directly on the label (the proven `claude --print` path). For a *transient* gh-aw failure you usually don't need this — `adlc-failover.yml` already auto-falls-back after 2 strikes; `ADLC_ENGINE=legacy` is the hard, all-issues override. Reset to `gh-aw` (or unset) to re-enable gh-aw.

**Verify:** labelling `adlc-generate` once more runs the proven `claude --print` hand-rolled path; no double-runs.

---

### Quick dependency note
Do **B → C → D → E → G → H → I → J**, then **F last** (branch protection blocks your own setup commits if enabled too early). Smoke test (K) only after F is on.
