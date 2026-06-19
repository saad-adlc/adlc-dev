# ADLC — Infra Setup Runbook

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
   - `ADLC_AGENT_TOKEN` — fine-grained PAT (or GitHub App token) with, on `saad-adlc/adlc-dev`: **Contents: RW, Pull requests: RW, Issues: RW, Pages: RW, Workflows: RW**, and on `saad-adlc/adlc-standards`: **Contents: R** (it gets cloned each run).
   - `CLAUDE_API_KEY` — the Azure AI Foundry key, used by the **hand-rolled** workflows (resource method: `CLAUDE_CODE_USE_FOUNDRY` + `ANTHROPIC_FOUNDRY_API_KEY`).
   - `ANTHROPIC_API_KEY` — **for the gh-aw path**: same Foundry key value, under this name (gh-aw auto-injects it into the claude engine). Verified: with `ANTHROPIC_BASE_URL=https://orix-adastra-adlc.services.ai.azure.com/anthropic`, header `x-api-key` returns 200 for model `claude-sonnet-4-6`. gh-aw strict mode forbids the key in `engine.env`, so it must be this secret.
4. 🖱️ `adlc-dev` → Settings → Secrets and variables → Actions → **Variables**. Create:
   - `ADLC_ENGINE` = `gh-aw`  *(documentation/fallback switch — see step 27)*
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

## E. gh-aw workflows + park the hand-rolled fallback (in `adlc-dev`)

> **Model:** gh-aw is primary; the hand-rolled `*.yml` are the **fallback**, parked on `workflow_dispatch` **as each gh-aw equivalent goes live** — staged, not all at once, so the pipeline never goes dark.

13. ✅ **Done:** `gh aw init` run; `adlc-review.md` + `.lock.yml` committed and **merged to `main`**. It's additive (new governance gate) — nothing to park for it. Needs the `ANTHROPIC_API_KEY` secret (§B) to run.
14. 🔜 **As each gh-aw replacement lands**, park its hand-rolled twin (`on:` → `workflow_dispatch` only, logic intact):
    - `adlc-generate.yml`, `adlc-iterate.yml` → park once their gh-aw ports exist (PLAN WS2/WS3, decision pending)
    - `adlc-ci.yml`, `adlc-preview.yml` → keep as real Actions (not agentic; not being ported)
    - `adlc-security-iterate.yml`, `adlc-signals.yml` → keep until/if ported
    **Currently nothing is parked** — all six still run; `adlc-review` runs alongside.

**Verify:** each parked `.yml` shows only a manual "Run workflow" button; no event triggers both a gh-aw lock workflow and its hand-rolled twin (no double-runs).

---

## F. Branch protection & required checks (the no-direct-merge gate)

> Do this **after** the gate-producing workflows exist and have run once (so their check names appear in the dropdown).

15. 🖱️ `adlc-dev` → Settings → Branches → Add branch ruleset (or classic protection) for `main`:
    - ✅ Require a pull request before merging
    - ✅ Require **≥1 approval**; ✅ Require review from **Code Owners**
    - ✅ Dismiss stale approvals on new commits
    - ✅ Require **status checks to pass**, and select: `CI — Node/React` (adlc-ci), the CodeQL checks **`Analyze (actions)`** + **`Analyze (javascript-typescript)`** (verified default-setup names), and **`adlc/business-approval`**. *(Secret-scanning push protection is not a PR status check — see §G.)*
    - ✅ Require branches up to date before merging
    - ✅ Block force pushes; ✅ Restrict deletions
    - ✅ Do **not** allow bypassing (or restrict bypass to nobody) — including admins, to honor no-direct-merge
16. 🖱️ Add `adlc-dev/.github/CODEOWNERS` mapping `workspaces/**` to your team/handle, and commit it.

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
24. 🖱️ `adlc-standards` → Settings → Actions → General → ensure **"Allow GitHub Actions to create and approve pull requests"** is enabled (needed for the bot to open PRs).

**Verify:** temporarily set one pin in `VENDOR.md` to an older tag, dispatch the bot → it opens a `vendor-sync:` PR with the correct diff.

---

## K. Smoke test (full loop)

25. ☁️ From a fresh claude.ai chat, run the ADLC skill end-to-end on a trivial feature (e.g. "hello world greeting").
26. 🖱️ Watch: issue created → gh-aw generate runs (claude-code-action, Foundry) → deny hooks active in logs → Spec-Kit artifacts committed → PR opened (not merged) → ci/CodeQL/secret-scan green → governance review comment + audit entry → PR blocked on approval + `adlc/business-approval`.
27. ☁️ Approve in chat (`/adlc-approved`) → business-approval check goes green → merge as a human → Pages preview surfaced.

**Verify:** every gate behaved as in PLAN §6; Foundry usage shows the spend.

---

## L. Fallback procedure (if gh-aw misbehaves)

28. 💻 Restore the hand-rolled engine: revert the `on:` blocks of the 6 parked workflows to their original triggers (git history has them), and disable the gh-aw workflows (rename `*.md`/remove `*.lock.yml` or set their `on:` to `workflow_dispatch`). Flip `ADLC_ENGINE` → `legacy` for clarity.

**Verify:** labelling `adlc-generate` once more runs the proven `claude --print` hand-rolled path; no double-runs.

---

### Quick dependency note
Do **B → C → D → E → G → H → I → J**, then **F last** (branch protection blocks your own setup commits if enabled too early). Smoke test (K) only after F is on.
