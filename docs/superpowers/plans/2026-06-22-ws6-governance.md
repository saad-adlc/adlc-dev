# WS6 — Governance Last-Mile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans (or subagent-driven-development). Checkbox (`- [ ]`) steps.

**Goal:** Complete the doc-9 *no-direct-merge* gate (PLAN WS6 / D10–D11): a human **code-owner review** + a required **`adlc/business-approval`** status check, with the governance reviewer's audit trail recorded as an immutable comment marker. Branch protection itself is manual (INFRA §F).

**Architecture:** The `adlc-review` gh-aw reviewer already posts a structured verdict (advisory, never approves). WS6 adds: `CODEOWNERS` (engineering gate), a plain `adlc-business-approval.yml` that turns the existing `adlc-approved` label into a required commit status (business gate, per-SHA so new commits re-require it), and an embedded `<!-- adlc-audit … -->` marker in the review comment (audit trail — strict mode forbids committing a file, same as iterate). All compose under a branch-protection rule.

**Tech Stack:** plain GitHub Actions (`actions/github-script`), gh-aw v0.79.8 (`adlc-review` recompile), CODEOWNERS.

## Global Constraints

- **Repos/branches:** adlc-dev paths on `ws6-governance`; the skill edit on `adlc-standards@ws6-governance`. Both from `origin/main`.
- **Decisions (grill 2026-06-22):** Q1 audit = **marker in the review comment** (no committed file); Q2 CODEOWNERS scope = **`workspaces/**` only**; owner = **`@saad-vts`**; Q3 business-approval = **per-SHA, re-require on new commits**.
- **Reuse, don't duplicate:** `adlc-signals.yml` already adds the `adlc-approved` label on `/adlc-approved:` (via the `ADLC_AGENT_TOKEN` PAT, so the `labeled` event *does* trigger other workflows). WS6 consumes that label; it does not re-implement approval capture.
- **Never-approve invariant:** the gh-aw reviewer stays advisory (never an approver, not a required check). The required gates are CODEOWNERS review + `adlc/business-approval` + CI/CodeQL.
- **Local-vs-CI:** YAML + CODEOWNERS + the audit-marker edit are authored and **YAML/structurally validated locally** (ruby). `gh aw compile adlc-review` (→ new lock) and the live gate behavior + branch protection are **[CI/you]**.

## File Structure

| Path | Responsibility |
|------|----------------|
| `.github/CODEOWNERS` | `workspaces/** @saad-vts` — generated-code PRs require a code-owner review |
| `.github/workflows/adlc-business-approval.yml` | Publishes the `adlc/business-approval` commit status: pending until `adlc-approved` label, success when present; per-SHA (synchronize → pending + drops stale label) |
| `.github/workflows/adlc-review.md` (edit) | Add the `<!-- adlc-audit … -->` marker to the governance comment body; recompile (`[CI/you]`) |
| `adlc-standards/skills/review-agent-governance/SKILL.md` (edit) | Revise the audit-output line: marker-in-comment, not a committed `audit.log` |
| `INFRA-SETUP.md` §F (edit) | Document the exact required-checks list incl. `adlc/business-approval` |

---

### Task 1: CODEOWNERS

**Files:** Create `.github/CODEOWNERS` (adlc-dev)

- [ ] **Step 1: Write the file**
```
# ADLC code owners.
# Generated-app PRs must get a human code-owner review before merge — enforced
# once branch protection's "Require review from Code Owners" is enabled (INFRA §F).
# Scope is intentionally narrow (the generated code); pipeline/governance changes
# rely on branch protection's general "require approval".
workspaces/**   @saad-vts
```

- [ ] **Step 2: Validate** `[local]`
Run: `grep -qE '^workspaces/\*\*[[:space:]]+@saad-vts$' .github/CODEOWNERS && echo OK`
Expected: `OK`. (GitHub also surfaces CODEOWNERS syntax errors in the repo's "Code owners" UI once pushed.)

- [ ] **Step 3: Commit**
```bash
git add .github/CODEOWNERS
git commit -m "feat(governance): CODEOWNERS — workspaces/** require @saad-vts review (WS6)"
```

---

### Task 2: `adlc-business-approval.yml` — the required approval status

**Files:** Create `.github/workflows/adlc-business-approval.yml` (adlc-dev)

**Interfaces:** Publishes commit-status context **`adlc/business-approval`** on the PR head SHA. Consumes the `adlc-approved` label (set by `adlc-signals.yml`). Uses the default `GITHUB_TOKEN` (least-privilege via `permissions:`), not the PAT.

- [ ] **Step 1: Write the failing validation (RED)** `[local]` — create `.github/workflows/test/check-business-approval.sh`:
```bash
#!/usr/bin/env bash
set -uo pipefail
F=.github/workflows/adlc-business-approval.yml
ruby -ryaml -e '
  d = YAML.safe_load(File.read(ARGV[0], encoding:"UTF-8"), aliases:true)
  on = d["on"] || d[true]
  raise "no pull_request trigger" unless on["pull_request"]
  t = on["pull_request"]["types"]
  %w[opened synchronize reopened labeled unlabeled].each { |x| raise "missing type #{x}" unless t.include?(x) }
  j = d["jobs"].values.first
  raise "needs statuses: write" unless d.dig("permissions","statuses") == "write" || j.dig("permissions","statuses") == "write"
  puts "OK adlc-business-approval.yml: pull_request types ok; statuses:write present"
' "$F"
grep -q "adlc/business-approval" "$F" || { echo "FAIL: missing status context adlc/business-approval"; exit 1; }
grep -q "adlc-approved" "$F" || { echo "FAIL: does not consume adlc-approved label"; exit 1; }
echo "business-approval checks pass"
```

- [ ] **Step 2: Run, see fail (RED)** `[local]` — Run: `bash .github/workflows/test/check-business-approval.sh`. Expected: fails (workflow file missing).

- [ ] **Step 3: Write the workflow (GREEN)** — create `.github/workflows/adlc-business-approval.yml`:
```yaml
name: ADLC — Business Approval Gate
# Publishes the required `adlc/business-approval` commit status for ADLC PRs.
# pending until the business user approves (the `adlc-approved` label, set by
# adlc-signals.yml on a `/adlc-approved:` chat comment); success once present.
# Per-SHA: a new commit (synchronize) resets to pending AND drops the stale label,
# so the business user re-approves the changed preview (grill Q3).
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled, unlabeled]

permissions:
  statuses: write          # publish the commit status (the required check)
  pull-requests: write     # drop a stale adlc-approved label on new commits
  contents: read

jobs:
  business-approval:
    if: startsWith(github.event.pull_request.head.ref, 'feature/issue-')
    runs-on: ubuntu-latest
    steps:
      - name: Set adlc/business-approval status
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            const action = context.payload.action;
            let approved = pr.labels.map(l => l.name).includes('adlc-approved');

            // New commits invalidate a prior approval: drop the stale label so the
            // label and the status stay consistent (no label == not approved).
            if (action === 'synchronize' && approved) {
              await github.rest.issues.removeLabel({
                ...context.repo, issue_number: pr.number, name: 'adlc-approved'
              }).catch(() => {});
              approved = false;
            }

            await github.rest.repos.createCommitStatus({
              ...context.repo,
              sha: pr.head.sha,
              context: 'adlc/business-approval',
              state: approved ? 'success' : 'pending',
              description: approved
                ? 'Business user approved the live preview'
                : 'Awaiting business approval — /adlc-approved: in chat',
              target_url: `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/pull/${pr.number}`,
            });
```

- [ ] **Step 4: Run validation (GREEN)** `[local]` — Run: `bash .github/workflows/test/check-business-approval.sh`. Expected: `OK …` + `business-approval checks pass`.

- [ ] **Step 5: Commit**
```bash
git add .github/workflows/adlc-business-approval.yml .github/workflows/test/check-business-approval.sh
git commit -m "feat(governance): adlc/business-approval required status (per-SHA, label-driven) (WS6)"
```

> `[CI/you]` runtime check (Task 6): on PR open the status is **pending** (red); after `/adlc-approved:` (→ label) it flips **success**; a new commit drops the label + returns to pending.

---

### Task 3: Audit marker in the governance review comment

**Files:** Modify `.github/workflows/adlc-review.md` (adlc-dev)

- [ ] **Step 1: Read the current Output section** to anchor the edit (`adlc-review.md`'s "## Output (via safe-outputs only)").
- [ ] **Step 2: Add the audit-marker instruction** to the review-comment bullet so the agent ends every governance comment with one machine-readable line:
```
- End the comment with a machine-readable audit marker on its own line (this IS the
  signed audit record — immutable in GitHub's event log, attributed to this workflow):
  `<!-- adlc-audit {"ts":"<ISO8601>","pr":<N>,"actor":"review-agent-governance","decision":"changes-requested|observations-only","findings":<count>,"sha":"<head-sha>"} -->`
```
- [ ] **Step 3: Validate locally** `[local]` — Run: `grep -q 'adlc-audit' .github/workflows/adlc-review.md && echo OK`.
- [ ] **Step 4: Recompile** `[CI/you]`: `gh aw compile adlc-review --approve` (regenerates `adlc-review.lock.yml`; bless any secret diff). Commit `.md` + `.lock.yml`.
- [ ] **Step 5: Commit (the `.md` now; lock with the recompile)**
```bash
git add .github/workflows/adlc-review.md
git commit -m "feat(governance): embed signed audit marker in the review comment (WS6)"
```

---

### Task 4: Revise the review-agent-governance skill (audit line)

**Files:** Modify `adlc-standards/skills/review-agent-governance/SKILL.md` (on `adlc-standards@ws6-governance`)

- [ ] **Step 1: Replace the "Signed audit-log entry appended to … audit.log … committed" bullet** with the marker form:
```
2. **Signed audit-log entry** embedded as a marker in the governance review comment
   (NOT a committed file — strict mode forbids `contents: write` in this gh-aw workflow):
   `<!-- adlc-audit {"ts","pr","actor":"review-agent-governance","decision","findings","sha"} -->`
   The comment is posted by the workflow identity and is immutable in GitHub's event
   log, so the action is attributable. (A plain workflow can later scrape these markers
   into a JSONL export if a git-tracked audit file is required.)
```
- [ ] **Step 2: Validate** `[local]` — Run: `grep -q 'embedded as a marker' adlc-standards/skills/review-agent-governance/SKILL.md && ! grep -q 'committed with the agent identity' adlc-standards/skills/review-agent-governance/SKILL.md && echo OK`.
- [ ] **Step 3: Commit (in adlc-standards)**
```bash
git -C ../adlc-standards add skills/review-agent-governance/SKILL.md
git -C ../adlc-standards commit -m "docs(skill): audit entry is a comment marker, not a committed file (WS6, strict-mode)"
```

---

### Task 5: Branch-protection runbook (INFRA §F) `[CI/you]`

**Files:** Modify `INFRA-SETUP.md` §F (document; the actual rule is manual web UI)

- [ ] **Step 1:** Ensure §F's required-checks list is exact and includes the business-approval gate:
  - Require a PR before merging; **≥1 approval**; **Require review from Code Owners**; **Dismiss stale approvals on new commits**.
  - Require status checks: **`ADLC — CI`**, **`Analyze (actions)`**, **`Analyze (javascript-typescript)`**, **`adlc/business-approval`**. (Add `adlc/business-approval` only after the workflow has posted it once — Task 6 Step 1 — so the context appears in the dropdown.)
  - Require branches up to date; block force-pushes; restrict deletions; **do not allow bypass** (incl. admins).
- [ ] **Step 2: Commit** the §F doc edit.

---

### Task 6: CI verification `[CI/you]`

Run after the WS6 PRs merge and `gh aw compile adlc-review` lands.

- [ ] **Step 1 — Status posts:** open a throwaway `feature/issue-*` PR → confirm a **`adlc/business-approval` = pending** status appears on the head SHA (now the context exists for the branch-protection dropdown).
- [ ] **Step 2 — Approve flips it:** comment `/adlc-approved: looks good` → `adlc-signals` adds the label → `adlc-business-approval` flips the status to **success**.
- [ ] **Step 3 — Re-require on new commit:** push a commit → status returns to **pending** and the `adlc-approved` label is dropped; re-comment `/adlc-approved:` → success again.
- [ ] **Step 4 — CODEOWNERS:** confirm GitHub requests review from `@saad-vts` on a `workspaces/**` change, and the PR is **blocked** on it until reviewed.
- [ ] **Step 5 — Audit marker:** confirm the `adlc-review` comment ends with a parseable `<!-- adlc-audit … -->` line; `gh pr view <N> --json comments` → the marker is present.
- [ ] **Step 6 — Branch protection (the whole gate):** a throwaway PR is **un-mergeable** until CI + CodeQL + `adlc/business-approval` are green **and** a code-owner approves; direct push to `main` is rejected. Record in the WS0 completion record / a WS6 note.

---

## Self-Review

**1. Spec coverage (PLAN WS6 / D10–D11):** CODEOWNERS ✓ T1 · `adlc/business-approval` required check ✓ T2 · review agent (already merged) + audit trail ✓ T3/T4 (marker) · branch protection + required-checks list ✓ T5 (manual) + T6 verify · never-approve invariant ✓ (reviewer unchanged; gates are CODEOWNERS + business-approval + CI).

**2. Placeholder scan:** none — CODEOWNERS, the full workflow YAML, and both doc edits are concrete. `[CI/you]` steps are real commands.

**3. Consistency:** `adlc/business-approval` context name identical in T2 (workflow), T5 (required-checks), T6 (verify). `adlc-approved` label name matches `adlc-signals.yml`. Audit-marker shape identical in T3 (workflow) and T4 (skill). Per-SHA re-require (Q3) implemented in T2 (synchronize → pending + label drop) and verified in T6 Step 3.

**Open items (not placeholders):**
- `adlc-review.md` recompile (`gh aw compile adlc-review --approve`) is `[CI/you]` — the audit-marker `.md` edit is authored here; the lock regenerates on your machine.
- The activation checklist (`2026-06-22-ghaw-generate-activation-checklist.md`, carried onto this branch) is committed with WS6 as a docs/superpowers runbook.
