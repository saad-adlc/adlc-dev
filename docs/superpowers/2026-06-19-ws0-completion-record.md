# WS0 Completion Record — Constitution + Steering + Deny Hooks

**Date:** 2026-06-19 · **Repo/branch:** `adlc-standards` @ `ws-doc9-standards` · **Status:** ✅ complete, PR opened against `main`
**Model:** Claude Opus 4.8 (1M context) · **Driven by:** the superpowers skill workflow

---

## Objective

Author the doc-9 foundation that every gh-aw workflow clones at CI runtime: the Spec-Kit constitution, the steering set, and the deterministic `PreToolUse` deny hook — and refactor `CLAUDE.md` to defer to them (PLAN.md WS0 + the WS4 hook artifact). Scope locked in the design doc decision **G4** (foundation + agentic spine), this record covers the foundation half.

## What was built (`adlc-standards`)

| File | Purpose |
|---|---|
| `hooks/pretooluse-deny.sh` | Deterministic deny hook (bash + jq), **fail-closed** |
| `hooks/settings.template.json` | Registers the hook on `Bash\|Write\|Edit` (exec form) |
| `hooks/test/run-tests.sh` | TDD harness — **40 assertions** |
| `hooks/test/check-docs.sh` | Structural checks for the docs (incl. no-duplication AC) |
| `constitution.md` | Spec-Kit project constitution (security, no-direct-merge, deterministic enforcement, audit trail, DoD) |
| `steering/AGENTS.md` | Agent role + operating rules + escalation ("stop and ask") list |
| `steering/approved-stack.md` | React+TS+Vite+Vitest only; multi-stack = future |
| `steering/compliance-rules.md` | What the governance reviewer checks |
| `CLAUDE.md` (edited) | Defers to constitution + steering; duplicated rules + stale `adlc-stage` removed |

### Deny-hook coverage (the deterministic guardrail)
Blocks, before execution, regardless of permission mode (verified it still fires under `--permission-mode bypassPermissions`):
- **Dangerous Bash** — `rm -rf /` / `~` / glob, `curl|sh` / `wget|bash`, fork-bomb, `dd if=`, `mkfs`, `>/dev/sd*`
- **Push/merge to protected branches** — `git push … main/master`, refspec forms (`HEAD:refs/heads/main`, `develop:main`), `git merge`, `gh pr merge`
- **Workspace confinement** — Write/Edit outside `$ADLC_WORKSPACE`; `.github/` + root-config writes; Bash-redirect escapes (`>`/`tee`/`sed -i` into `.github`/root; `..` traversal; other-workspace redirects)
- **Secrets** — AWS (`AKIA…`), `ghp_…`, `github_pat_…`, Slack (`xox…`), PEM private keys, generic `secret/token/password/api_key = …`

## Process (superpowers workflow, in order)

1. **brainstorming + grill-me** → 2 decisions resolved (Spec-Kit depth = structured artifacts; scope = foundation+spine), design doc written + approved.
2. **using-git-worktrees** → branches `ws-doc9-standards` / `ws-doc9-impl` from `origin/main`.
3. **writing-plans** → Plan 1 (9 TDD tasks), placeholder-free, hook code grounded on the verified Claude Code hook contract.
4. **executing-plans** → 9 tasks, each RED → GREEN → commit. The deny hook was genuinely test-driven (every rule added as a failing test first).
5. **requesting-code-review** → independent Opus reviewer.
6. **finishing-a-development-branch** → tests verified, PR opened.

## Code review outcome (Opus)

Verdict: **"With fixes."** Findings and resolution:

| ID | Sev | Finding | Resolution |
|---|---|---|---|
| C1 | Critical | Unguarded `jq` on `command`/`file_path`/`content` → **fail-open** if jq errored | **Fixed** — `\|\| deny` on every extraction; stderr suppressed so the deny reason surfaces |
| I1 | Important | `HEAD:refs/heads/main` / `develop:main` pushes allowed | **Fixed** — refspec-aware regex |
| I2 | Important | Bash redirects to other-workspace / `..` allowed; constitution overstated guarantee | **Fixed** — redirect confinement added; constitution wording qualified |
| I3 | Important | CLAUDE.md still duplicated "Stop and ask"/"Boundaries" | **Fixed** — moved to AGENTS.md; CLAUDE.md defers; check strengthened |
| I4 | Important | Stale `adlc-stage` reference | **Fixed** |
| I5 | Important | No fail-open / refspec / traversal regression tests | **Fixed** — added (40 assertions total) |
| M1 | Minor | `github_pat_` not matched | **Fixed** |
| M2 | Minor | Secret regex false-positives on `const token = …` | **Deferred** — loosening detection needs dedicated tuning; recorded below |
| M4 | Minor | `args:[]` "ignored" | **Pushed back** — `args` is the documented exec form (confirmed via Claude Code docs); kept |
| M3, M5 | Minor | `perl -i`/`awk -i`, `curl\|python` not caught | Accepted as documented heuristic limits (defense-in-depth + governance review compensate) |

## Verification (fresh evidence)

```
bash hooks/test/run-tests.sh   → PASS=40 FAIL=0
bash hooks/test/check-docs.sh  → docs OK
```
10 commits ahead of `origin/main`; working tree clean; pushed + PR opened.

> **Update (2026-06-22, post-merge):** the live T8 smoke (`docs/superpowers/2026-06-22-ghaw-generate-smoke-outcome.md`) found the deny hook denied Claude's **absolute** `Write`/`Edit` paths (the tools always pass absolute paths; the hook compared against the relative `$ADLC_WORKSPACE`), making the agent build flaky. Fixed in `adlc-standards` **PR #4**: `path_outside_workspace` now normalizes the `$GITHUB_WORKSPACE` prefix and rejects `..` traversal. Hook suite **40 → 47** assertions.

## Known limitations / follow-ups

- **M2 (secret false-positives):** the generic `token|password|secret|api_key = <12+ chars>` rule can fire on ordinary identifiers (`const token = useAuthContext()`). Tuning (require a quoted/high-entropy value) deferred to avoid hastily loosening detection. The agent gets a clear deny reason and can rename in the meantime.
- **Bash write confinement is heuristic** — `cp`/`mv`/`perl -i`/`awk -i inplace` and absolute non-`.github` writes aren't all caught. Defense-in-depth: the Write/Edit tool path is fully confined, and the governance reviewer + CODEOWNERS + branch protection are the compensating gates.
- These are residual *heuristic* limits, not fail-open bugs — the hook fails closed on anything it cannot evaluate.

## Relationship to the earlier WS0 attempt

PLAN.md §1b referenced an earlier `ws0-constitution-steering-hooks` branch (authored, never merged — `adlc-standards` `main` had no constitution/steering/hooks). This WS0 was built **fresh** from `origin/main` with TDD + code review and **supersedes** that branch. Recommend closing the old branch/PR to avoid two competing WS0s.

## Next

**WS4 wiring + WS2/WS3** (Plan 2, `adlc-dev` `ws-doc9-impl`): the gh-aw `adlc-generate.md` / `adlc-iterate.md` workflows mount `hooks/settings.template.json` + `pretooluse-deny.sh` (exporting `ADLC_WORKSPACE`) before the agent runs, and clone these constitution/steering files at CI runtime.
