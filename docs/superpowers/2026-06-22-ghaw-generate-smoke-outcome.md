# gh-aw Generate — T8 Smoke Outcome (live, end-to-end)

**Date:** 2026-06-22 · **Repo:** `saad-adlc/adlc-dev` (+ `saad-adlc/adlc-standards`) · **Engine:** gh-aw generate (`ADLC_ENGINE=gh-aw`) · **Model:** agent runs on `claude-sonnet-4-6` (Foundry); driven/diagnosed with Opus 4.8.
**Status:** ✅ **PASSED end-to-end** — a labelled business issue produced a tested, reviewed, **live-previewable** PR. Four real defects were caught and three fixed; one (audit marker) deferred.

---

## What was tested

The happy-path of the doc-9 spine, on a real "hello world" feature: a **Hello-greeting** React app (name input + Greet button; greets the typed name, trims, falls back to `Hello, World!`, Enter-to-greet). Filed as a business-language GitHub issue, labelled `adlc-generate`, and followed through the entire pipeline.

Final successful run: **issue #39 → PR #40** (after two earlier attempts surfaced the fixes below).

## Result scorecard

| Stage | Check | Result |
|---|---|---|
| Engine routing | T8.1a — one generator, no double-run | ✅ gh-aw `ADLC Generate` ran; hand-rolled `ADLC — Generate Feature` **skipped** |
| Deny hook | T8.1b/T8.3 — loads + enforces under Foundry | ✅ proven live (it denied + the fix made it pass legit writes) |
| Agent build | spec/plan/tasks + TDD component via `Write` | ✅ (after the hook fix) |
| Fallback B | T8.4a — scaffold + artifacts + tests in the PR | ✅ 15 files (`package.json`…, `spec/plan/tasks.md`, `Greeter.tsx`, `Greeter.test.tsx`, `App.tsx`, `.adlc/status.json`) |
| PR creation | opens under a real identity → triggers downstream | ✅ **PR #40 authored by `saad-vts` (PAT)** |
| CI | T8.4b — `adlc-ci` green | ✅ tsc + eslint + vitest; **coverage 90.8% lines / 93.3% branches / 80% functions** |
| Preview | T8.4b — `adlc-preview` deploys, URL on PR | ✅ **LIVE (HTTP 200)** — serves the app shell |
| Status channel | T8.4c — status.json transitions | ✅ `…→ pr-open → preview-deployed`, authoritative `preview_url` |
| Business-approval | gate posts status | ✅ ran (`pending` until `adlc-approved` applied) |
| Governance review | advisory verdict, no auto-merge | ✅ **observations-only**, no blocking, no `adlc-iterate` label, did not approve/merge |

**Playable preview:** `https://saad-adlc.github.io/adlc-dev/previews/pr-40-issue-39-hello-greeting/`

## Defects the smoke caught (none would surface in static review)

| # | Defect | Impact | Fix | Status |
|---|---|---|---|---|
| 1 | Repo variable misspelled **`ALDC_ENGINE`** | Workflows read `vars.ADLC_ENGINE` = undefined → gh-aw ran "by accident"; documented `=legacy` rollback was **silently dead** | Created correct `ADLC_ENGINE=gh-aw`, deleted the typo | ✅ Fixed |
| 2 | gh-aw `create-pull-request` used default **`GITHUB_TOKEN`** | (a) org bars Actions from opening PRs → fell back to a "review issue"; (b) even if allowed, a `GITHUB_TOKEN` PR triggers **no** downstream CI | Wired `github-token: ${{ secrets.ADLC_AGENT_TOKEN }}` into the safe-output (branch push **and** PR API now use the PAT) | ✅ Fixed — adlc-dev **PR #35** |
| 3 | Deny hook denied **absolute** `Write`/`Edit` paths | Claude's tools always pass absolute paths; hook compared against the relative `$ADLC_WORKSPACE` → every legit in-workspace write denied → agent fought Bash heredocs (hit Claude's built-in obfuscation analysis) → **flaky/failed builds** (passed once by luck, failed next run) | `path_outside_workspace` normalizes `$GITHUB_WORKSPACE`-absolute → repo-relative; also rejects `..` traversal (closed a real escape hole). +7 regression tests → **47/47** | ✅ Fixed — adlc-standards **PR #4** |
| 4 | Governance reviewer omits the `<!-- adlc-audit {…} -->` marker | The WS6 machine-readable audit JSON depends on the **agent** emitting it — contradicts "deterministic over model judgment"; sonnet-4-6 skipped it at runtime | **Deferred** (see below) | ⏳ Open follow-up |

### Hook fix detail (updates the WS0 hook)
`adlc-standards/hooks/pretooluse-deny.sh` — `path_outside_workspace()` now:
1. strips `${GITHUB_WORKSPACE:-$PWD}/` from absolute paths before the workspace check (so Claude's absolute `Write`/`Edit` paths into `workspaces/<slug>/` are recognised as in-bounds);
2. rejects any leftover absolute path **or** `..` segment (previously `workspaces/<slug>/../../etc/passwd` matched the prefix and was *allowed* — now denied).

Test suite **40 → 47** assertions (7 new: absolute-in-ws allow, absolute other-ws/escape deny, relative+absolute traversal deny). `check-docs.sh` still green. Behaviour described in `constitution.md`/WS0 is unchanged — only the implementation was made correct + hardened.

## Deferred: the audit marker (WS6 follow-up)

The governance comment already carries gh-aw's **immutable, attributed provenance footer** (workflow id, run URL, model, AIC cost), and the decision is both in the comment text and deterministically signalled by the `adlc-iterate` label (applied ⟺ blocking findings). The custom agent-emitted JSON marker is therefore partly redundant and, more importantly, **shouldn't depend on the model**. Options considered (decision deferred by the user):
- **Accept gh-aw's footers** as the audit trail (drop the custom marker; simplest, fully deterministic).
- **Deterministic audit step** that writes `{decision,findings,sha,pr}` from the label + run metadata (most faithful to the original intent, no model trust).
- ~~Harden the prompt~~ — rejected in spirit: keeps it model-dependent (the exact principle we just violated).

## Not yet exercised (remaining T8 / activation)

- **T8.5** 2-strike fail-over to hand-rolled (the earlier #36 *agent* failure pre-fix did **not** drive a fail-over comparison cleanly — re-run intentionally on a fresh issue).
- **T8.6** manual engine switch (`ADLC_ENGINE=legacy` → only hand-rolled runs).
- **T8.7** iterate (`/adlc-iterate:` → fix commit → cap at 3).
- **Branch protection (INFRA §F)** on `main` — still **off** (verified 404). Gates *merge*, not generate; required for the WS6 merge-governance test.

## Test artifacts to clean up

Issues #33/#36/#39 (test triggers, created this session), auto-created review issue #34, test PR #40, and orphan branches `feature/issue-33-hello-greeting` (pushed by the pre-PAT run) + `feature/issue-39-hello-greeting`. Safe to close/delete once this record is reviewed.
