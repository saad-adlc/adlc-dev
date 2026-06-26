# ADLC — From-Scratch Setup & Org-Migration Runbook

> **Scenario:** stand the whole ADLC pipeline up in a clean GitHub org (e.g. migrating `saad-adlc` → an `orix` org) where the two repo **names already exist** (`adlc-dev`, `adlc-standards`) but nothing else is configured. This consolidates `INFRA-SETUP.md` + the WS10 (merge gate), WS11 (metrics/ADX) work, and every hard-won lesson, into one ordered checklist.
>
> **The core premise — a `git clone`/push is NOT enough.** Pushing the code moves files and branch contents only. **None** of the following travel with it and must be re-established by hand: org/repo settings, **secrets**, **variables**, **branch protection**, **labels**, **GitHub Pages**, **CodeQL/secret-scanning**, the **bot PAT**, the **claude.ai connector + uploaded Skill**, the **Azure** resources (Foundry model endpoint, ADX), and — critically — every place the old org/owner name is **hardcoded** in workflows, scripts, the compiled gh-aw lock, the bootstrap Skill, and `CODEOWNERS`.
>
> **Legend:** 🖱️ GitHub web UI · 💻 terminal · ☁️ claude.ai web · ⚠️ gotcha that has bitten us. Replace `<ORG>` with the target org slug throughout.

---

## 0. Inventory — what transfers, what doesn't

| Component | Lives in | Travels with `git push`? | Action |
|---|---|---|---|
| Workflows, scripts, hooks, vendored blocks, Skill source | repo files | ✅ yes | push (then **rename owner** — §2) |
| Hardcoded `saad-adlc` / `saad-vts` / `*.github.io` refs | repo files | ✅ (but **wrong**) | **find-replace + recompile lock** (§2) |
| Bot identity + **PAT** (`ADLC_AGENT_TOKEN`) | account + repo secret | ❌ | create bot, mint PAT (§3) |
| Secrets + variables | repo settings | ❌ | recreate (§4) |
| Azure Foundry model endpoint + key | Azure | ❌ | provision/point at it (§5) |
| Labels (5 of them) | repo | ❌ | create (§6) |
| gh-aw compiled `*.lock.yml` | repo files | ✅ (stale) | **recompile** after §2 (§7) |
| GitHub Pages config | repo settings | ❌ | enable (§8) |
| CodeQL / secret-scan / Dependabot | repo settings | ❌ | enable (§9) |
| Branch protection / required checks | repo settings | ❌ | apply **last** (§10) |
| `metrics` store branch | branch | ❌ (orphan) | create (§11) |
| ADX cluster + ingestion identity | Azure | ❌ | provision (§12, parked) |
| claude.ai GitHub connector + uploaded Skill | claude.ai | ❌ | install + upload (§13) |

---

## 1. Prerequisites

1. 💻 Tooling: `gh --version`, `gh auth status` (logged in with **admin on `<ORG>`**), `node --version` (v20.x), `git --version`, `unzip`, `jq`.
2. 🖱️ **Admin** on both `<ORG>/adlc-dev` and `<ORG>/adlc-standards` (Settings tab visible).
3. ☁️ Access to the **Azure** tenant that hosts (or will host) the Foundry model resource, and later ADX.
4. 🖱️ A **bot account** for the org (a dedicated machine user is strongly preferred over a personal account — see §3 and gotcha D-7).

**Verify:** `gh auth status` shows `<ORG>` with admin scope.

---

## 2. ⚠️ Rename the owner (the step that makes a clone insufficient)

The owner/org is **hardcoded** in these files. After pushing the code to `<ORG>`, replace `saad-adlc` → `<ORG>` (and `saad-vts` → the bot/team) in:

- `adlc-dev/.github/workflows/`: `adlc-ci.yml`, `adlc-preview.yml`, `adlc-generate.yml`, `adlc-iterate.yml`, `adlc-security-iterate.yml`, `adlc-generate.md`
- `adlc-dev/.github/scripts/adlc-prep.sh` (clones `saad-adlc/adlc-standards`)
- `adlc-dev/.github/CODEOWNERS` (`@saad-vts` → the bot/team)
- `adlc-standards/skills/adlc-bootstrap/SKILL.md` + `observe.md` (repo refs + the `*.github.io` preview URL)

```bash
# from each repo root, after pushing — review the diff before committing
grep -rl 'saad-adlc' . --include='*.yml' --include='*.md' --include='*.sh' | grep -v vendor/ \
  | xargs sed -i '' 's#saad-adlc#<ORG>#g'         # macOS sed; GNU: sed -i 's#...#...#g'
# CODEOWNERS owner
sed -i '' 's#@saad-vts#@<ORG-bot-or-team>#' .github/CODEOWNERS
```

- **The compiled gh-aw lock (`adlc-generate.lock.yml`) also contains `saad-adlc` — do NOT hand-edit it.** Edit `adlc-generate.md`, then **recompile** (§7) so the lock regenerates with the new owner + a matching hash.
- The **Foundry host** `orix-adastra-adlc.services.ai.azure.com` is an Azure resource name, not the GitHub org — leave it unless Azure provisions a different resource (§5).
- The metrics scripts (`metrics-sink.sh`, `metrics-harvest.sh`) use `GITHUB_REPOSITORY` at runtime — **org-agnostic, no edit needed.**

**Verify:** `grep -rn 'saad-adlc' .github` returns nothing in `adlc-dev` (outside `docs/`), and the same in `adlc-standards/skills`.

---

## 3. Bot identity & the PAT

The pipeline opens PRs and pushes as a **PAT**, never the default `GITHUB_TOKEN` (gotcha D-4 below).

4. 🖱️ Create/confirm the **bot account** as a member of `<ORG>` with **write** on both repos (and a `CODEOWNERS` entry if you require code-owner review).
5. 🖱️ As the bot, mint a **fine-grained PAT** with, on `<ORG>/adlc-dev`: **Contents RW, Pull requests RW, Issues RW, Pages RW, Workflows RW, Actions RW**; on `<ORG>/adlc-standards`: **Contents R** (it is cloned every run; **RW** if the vendor-sync bot opens PRs there).
6. 🖱️ Org → Settings → Actions → General → set **"Allow GitHub Actions to create and approve pull requests"** as your policy dictates. *Even if OFF, the PAT path works* (that is the point); the default token cannot open PRs here regardless.

**Verify:** `gh api user` as the bot resolves; the PAT can read `adlc-standards` and write `adlc-dev`.

---

## 4. Secrets & variables (the exact live names)

🖱️ `<ORG>/adlc-dev` → Settings → Secrets and variables → Actions.

**Secrets:**

| Secret | What | Notes |
|---|---|---|
| `ADLC_AGENT_TOKEN` | the bot PAT (§3) | used by generate/iterate/preview/metrics for PR-create + branch/metrics pushes |
| `ANTHROPIC_API_KEY` | the Azure Foundry key | **gh-aw path** (strict mode forbids the key in `engine.env`, so it must be a secret) |
| `CLAUDE_API_KEY` | same Foundry key value | **hand-rolled** legacy/iterate path |
| `GH_AW_GITHUB_TOKEN` | the PAT (or `GITHUB_TOKEN`) | gh-aw's git ops token |
| `GH_AW_GITHUB_MCP_SERVER_TOKEN` | the PAT | gh-aw's GitHub MCP server (read PRs/issues) |
| `GH_AW_CI_TRIGGER_TOKEN` | the PAT | lets gh-aw safe-outputs trigger downstream CI |
| *(`GITHUB_TOKEN`)* | — | auto-provided by Actions; do not create |

> `ANTHROPIC_API_KEY` and `CLAUDE_API_KEY` are the **same Foundry key** under two names (two engines reference different names). Set both.

**Variables:**

| Variable | Value | Purpose |
|---|---|---|
| `ADLC_ENGINE` | `gh-aw` | engine switch: `gh-aw` = primary+auto-fallback, `legacy` = force hand-rolled. ⚠️ **spell it EXACTLY** — a typo (we hit `ALDC_ENGINE`) makes the `=legacy` rollback silently dead and gh-aw run "by accident" |
| `GH_AW_DEFAULT_MAX_TURNS` | e.g. `50` | per-run agent turn cap |
| `GH_AW_DEFAULT_MAX_AI_CREDITS` | (set a ceiling) | per-run AI-credit cap |
| `GH_AW_DEFAULT_MAX_DAILY_AI_CREDITS` | e.g. `5000` | daily AI-credit cap |
| `GH_AW_DEFAULT_DETECTION_MAX_AI_CREDITS` | (small) | cap for gh-aw's detection step |

🖱️ `<ORG>/adlc-standards` → add `ADLC_AGENT_TOKEN` too (the vendor-sync bot opens PRs there).

**Verify:** `gh variable list -R <ORG>/adlc-dev` shows exactly one `ADLC_ENGINE`; all secrets present.

---

## 5. Azure Foundry (the model endpoint)

7. ☁️/Azure: confirm (or provision) the Foundry resource with a **`claude-sonnet-4-6`** deployment, reachable at `https://<resource>.services.ai.azure.com/anthropic`.
8. Use the **base-URL method** (verified): `ANTHROPIC_BASE_URL=<that URL>` + the key as the **`ANTHROPIC_API_KEY`** secret (header `x-api-key`). ⚠️ The **resource method** (`CLAUDE_CODE_USE_FOUNDRY`) is **NOT** expressible under gh-aw strict mode — base-URL is the only path for the gh-aw engine. `adlc-generate.md`'s `engine.env.ANTHROPIC_BASE_URL` + `network.allowed` must name this host.

**Verify:** a `curl` to the endpoint with `x-api-key` returns 200 for `claude-sonnet-4-6`.

---

## 6. Labels (pipeline triggers — they don't clone)

9. 💻 Create the five labels on `<ORG>/adlc-dev`:
```bash
for L in adlc-generate adlc-generated adlc-iterate adlc-approved adlc-fallback; do
  gh label create "$L" -R <ORG>/adlc-dev --force; done
```
Roles: **`adlc-generate`** = the build trigger · **`adlc-generated`** = marks generated PRs · **`adlc-iterate`** = trigger the self-heal loop · **`adlc-approved`** = business sign-off (sets `adlc/business-approval`) · **`adlc-fallback`** = the 2-strike failover routes here.

**Verify:** `gh label list -R <ORG>/adlc-dev` shows all five.

---

## 7. gh-aw extension + recompile + engine coexistence

10. 💻 Install the pinned CLI extension: `gh extension install github/gh-aw --pin v0.79.8` → `gh aw version` shows `v0.79.8`.
11. 💻 **Recompile the locks after §2** (the rename) so they regenerate with `<ORG>`:
```bash
cd adlc-dev && gh aw compile adlc-generate && gh aw compile adlc-review
```
12. Confirm coexistence: gh-aw `adlc-generate` has `if: vars.ADLC_ENGINE != 'legacy'`; the hand-rolled `adlc-generate.yml`/`adlc-iterate.yml` are guarded to the `adlc-fallback` label or `ADLC_ENGINE == 'legacy'`; `adlc-failover.yml` is the 2-strike controller.

**Verify:** with `ADLC_ENGINE=gh-aw`, labelling `adlc-generate` runs **only** the gh-aw lock (hand-rolled skips); `ADLC_ENGINE=legacy` flips it — never both.

---

## 8. GitHub Pages (preview hosting)

13. 🖱️ `<ORG>/adlc-dev` → Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / root. (The preview workflow publishes per-PR previews here; the URL base becomes `https://<ORG>.github.io/adlc-dev/previews/...` — already covered by the §2 rename.)

**Verify:** after the first preview deploy, `https://<ORG>.github.io/adlc-dev/previews/pr-<N>-<slug>/` loads.

---

## 9. Code security

14. 🖱️ `<ORG>/adlc-dev` → Settings → Code security:
    - **CodeQL / code scanning** → enable **default setup** (produces `Analyze (actions)` + `Analyze (javascript-typescript)`). ⚠️ Do **not** add a `codeql.yml` — it conflicts with default setup.
    - **Secret scanning** → on (free on public repos) → enable **Push protection**.
    - **Dependabot** → alerts + security updates on; `dependabot.yml` scoped to `workspaces/` (WS5).
    - ⚠️ Fix the dead guard: `adlc-security-iterate.yml` checks `check_run.name == 'Analyze'` but the real names are `Analyze (actions|javascript-typescript)` → change to `startsWith(... , 'Analyze')` or it never fires (WS5).

**Verify:** an `AKIA…`-style string is blocked on push; the two `Analyze` checks run on a PR.

---

## 10. Branch protection (the merge gate — apply LAST)

> Do this **after** the gate workflows have run once so their check names appear. ⚠️ Applying it too early blocks your own setup commits to `main`.

15. 💻 Required status checks (the **WS10** state — CI is enforced; business-approval is the deferred half):
```bash
cat > /tmp/rsc.json <<'JSON'
{ "strict": false, "contexts": ["Analyze (actions)", "Analyze (javascript-typescript)", "CI — Node/React"] }
JSON
gh api -X PATCH repos/<ORG>/adlc-dev/branches/main/protection/required_status_checks --input /tmp/rsc.json
# plus: require a PR, enforce_admins, block force-push, restrict deletions
```
16. ⚠️ **`adlc/business-approval` is NOT yet a required check** — it posts only on `feature/issue-*` branches, so requiring it would **permanently block manual PRs** to `main`. Make it auto-pass non-`feature/issue-` PRs first, then add it (closes drift-log **D-8**, the approval half).
17. **Human review:** require ≥1 CODEOWNERS approval **only once a distinct bot identity exists** (gotcha **D-7**) — else the solo maintainer can't approve the bot's own PR. Until then: require-PR + `enforce_admins` + 0 approvals (solo-safe).

> ⚠️ A **skipped** `CI — Node/React` (on a docs-only PR, where the job's `if` is false) **satisfies** the required check — confirmed live — so non-code PRs are not locked.

**Verify:** a generated PR's **head** carries `CI — Node/React` + the two `Analyze`; a PR with red/absent CI cannot merge; direct push to `main` is rejected.

---

## 11. Metrics store — the `metrics` branch (WS11 Phase 1)

18. 💻 Create the store as a **clean orphan branch** (so it never looks like a stale feature branch or invites a merge):
```bash
cd adlc-dev
git switch --orphan metrics
git commit --allow-empty -m "init metrics store"
git push -u origin metrics
git switch -
```
19. The collector (`adlc-metrics-collector.yml`, on `workflow_run`) and harvester (`adlc-metrics-harvest.yml`, hourly) then write JSONL events to `metrics:data/` via the Contents API. ⚠️ **Never merge `metrics`** — the "Compare & pull request" banner is a trap; it would dump data files onto `main`.

**Verify:** dispatch `ADLC — Metrics Harvest` → a `data/snapshots-*.jsonl` appears on the `metrics` branch; after a real build, a `data/run-*.jsonl` lands with real tokens/credits.

---

## 12. Azure Data Explorer (WS11 Phase 2 — parked)

> The git `metrics` branch is a **bridge**. The real store is ADX. Per-feature tokens/credits already flow (Phase 1); ADX adds KQL, dashboards, alerts, scale, and the optional Foundry billed-cost cross-check. The sink is pluggable, so the repo change is small.

**Azure (you):**
1. Create an ADX **cluster + database** (`adlc`). ⭐ Start with the **free cluster** (no Azure cost) for this volume.
2. Create the **events table + JSON ingestion mapping** (KQL paste; provided with the wiring).
3. Register an **Entra app (service principal)** + client secret; grant it the **Database Ingestor** role on `adlc`. Capture: tenant ID, client ID, client secret, ingest URI (`https://ingest-<cluster>.<region>.kusto.windows.net`).
4. *(Optional cost cross-check)* Foundry resource → **Diagnostic settings** → export token/usage to Log Analytics.

**GitHub (you):** add secrets `ADX_SP_CLIENT_ID`, `ADX_SP_CLIENT_SECRET`, `ADX_SP_TENANT` + vars `ADX_INGEST_URI`, `ADX_DATABASE`, `ADX_TABLE`.

**Repo (wiring — small):** add the `adx` path to `metrics-sink.sh` (Entra token → queued-ingestion POST); flip the workflows' `MX_SINK` to `adx`; **retire the `metrics` branch** once ADX is confirmed. Then **Phase 3** (Power BI/ADX dashboards) + **Phase 4** (four KQL alerts: per-feature token ceiling, daily/weekly spend, reliability spike, aging PRs).

**Verify:** a synthetic event lands in ADX and is KQL-queryable; the four alerts fire on synthetic breaches.

---

## 13. claude.ai connector + bootstrap Skill (intent capture)

20. ☁️ claude.ai → Settings → Connectors → **GitHub** → Connect → install the connector's **GitHub App on `<ORG>`** (not just a personal account) with **read+write** on `adlc-dev`, read on `adlc-standards`. ⚠️ A 403 "Resource not accessible by integration" = the App isn't installed on the **org** with scope. After changing permissions, **disconnect → reconnect** to mint a fresh token.
21. ☁️ Upload the **`adlc-bootstrap` Skill** — the **whole bundle**: `SKILL.md` + the three reference files (`interview.md`, `preview.md`, `observe.md`) from `adlc-standards/skills/adlc-bootstrap/`. (Source of truth stays in the repo; the sync-bot owns it.)

**Verify:** a fresh claude.ai chat + the Skill reads the live constraints, runs the interview, shows a **clickable HTML wireframe** + a **Build Card**, files a labelled `adlc-generate` issue, and narrates the build to the **live Pages link**.

---

## 14. Vendored blocks + sync bot

22. The vendored blocks (`vendor/spec-kit@v0.10.3`, `vendor/gh-aw@v0.79.8`, the superpowers TDD/verification skill, grill-me/handoff) **travel with the clone** — confirm `adlc-standards/VENDOR.md` pins each with a concrete tag/SHA + license; nothing references `@latest`.
23. 💻 (WS1) `adlc-standards/.github/workflows/vendor-sync.yml` (weekly + dispatch) opens a `vendor-sync:` PR when an upstream pin is stale, using `ADLC_AGENT_TOKEN`.

**Verify:** set one `VENDOR.md` pin to an older tag, dispatch the bot → it opens the diff PR.

---

## 15. Smoke test (the full loop)

24. ☁️/💻 File a trivial issue (e.g. a "hello world" greeting) and add `adlc-generate` (or run it through the Skill).
25. Watch: **ADLC Generate** runs (legacy **skipped**) → spec/plan/tasks + TDD code → **PR opened under the PAT** → `CI — Node/React` + CodeQL green → **live Pages preview** comment → governance review + audit marker → `adlc/business-approval` pending.
26. ☁️ `/adlc-approved` → business-approval green → a **human** merges → preview surfaced. Confirm the metrics collector wrote a `run-*.jsonl` with real tokens.

**Verify:** every gate behaves as designed; Foundry shows the spend; the metrics branch has the run event.

---

## 16. Ordering & final checklist

**Order:** §1 → §2 (rename) → §3 (bot/PAT) → §4 (secrets/vars) → §5 (Foundry) → §6 (labels) → §7 (gh-aw recompile) → §8 (Pages) → §9 (security) → §11 (metrics branch) → **§10 (branch protection) near-last** → §13 (connector/Skill) → §14 (sync bot) → §15 (smoke). §12 (ADX) whenever Azure is ready.

- [ ] Owner renamed everywhere + lock recompiled (§2/§7) — `grep saad-adlc` clean
- [ ] Bot PAT created; secrets `ADLC_AGENT_TOKEN`/`ANTHROPIC_API_KEY`/`CLAUDE_API_KEY`/`GH_AW_*` set (both repos as noted)
- [ ] `ADLC_ENGINE=gh-aw` (spelled exactly) + the `GH_AW_*` caps set
- [ ] Foundry base-URL reachable (200)
- [ ] 5 labels created
- [ ] Pages on `gh-pages`; CodeQL default setup + secret-scan push protection + Dependabot on
- [ ] `metrics` orphan branch created
- [ ] Branch protection: PR required, `enforce_admins`, no force-push, required = `Analyze (actions)`+`Analyze (javascript-typescript)`+`CI — Node/React`
- [ ] Connector installed on `<ORG>`; bootstrap Skill (4 files) uploaded
- [ ] Smoke test green end-to-end

---

## 17. ⚠️ Migration gotchas (the lessons, condensed)

- **D-4 — token identity.** PRs/pushes use the **PAT**, never `GITHUB_TOKEN`: the org bars Actions from opening PRs, and a `GITHUB_TOKEN`-authored PR triggers **no** downstream CI. *(Corollary: an agent/automation that opens a PR with a non-triggering token gets no CI — validate gates with a user/pipeline-driven PR.)*
- **D-8 — moving head.** Status is an **in-place PR comment** (marker `<!-- adlc-status -->`), not a `[skip ci]` branch commit — so the PR head keeps its checks and they can be required. Don't reintroduce status commits.
- **D-7 — bot identity.** Required human CODEOWNERS approval needs a **distinct** bot identity, or the solo maintainer can't approve the bot's own PR. Solo-safe protection until then.
- **`ADLC_ENGINE` spelling** is load-bearing — a typo silently disables the legacy rollback.
- **Branch-protection state lags** ~30–60s after a check completes (reads `BLOCKED`, then settles `CLEAN`/`UNSTABLE`); don't conclude from one early poll. A **skipped** required check counts as **passing**.
- **gh-aw locks are generated** — edit the `.md` + `gh aw compile`; never hand-edit `*.lock.yml`.
- **Never merge the `metrics` branch.**
