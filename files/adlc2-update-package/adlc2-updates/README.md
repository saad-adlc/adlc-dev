# ADLC v2 update package — README

Drop-in replacements for the project's skills and instructions, implementing
every change approved in the pipeline review (mock run: mortgage sweet-spot
calculator, June 11 2026).

## 1. REMOVE from the project (10 skills — do this first)

The entire ADLC v1 set. Its orchestrator shares v2's broad trigger (routing
is nondeterministic) and it targets adlc-staging, which v2 declares
unreachable — a mis-trigger ships a build into a void.

- adlc-orchestrator
- adlc-interview-user
- adlc-write-spec
- adlc-wireframe-preview
- adlc-branch-management
- adlc-read-standards
- adlc-code-generation
- adlc-validate-output
- adlc-create-pr
- adlc-auto-iterate

## 2. REPLACE project instructions

Use PROJECT-INSTRUCTIONS.md. Changes: React-only declared up front; Phase 9
named and defined; spec rollback, cancel, queueing, stall rule, detail-
paraphrase rule, and approval signal added to hard rules.

## 3. REPLACE / ADD skills (11 folders in this package)

| Skill | Status | What changed |
|---|---|---|
| adlc2-orchestrator | replaced | Canonical slug algorithm written out · stall rule (15 min via `updated`) · monitor loop: card handoff documented as the normal path · in-ci message classification (status / small change / spec problem / cancel / new request) · SPEC ROLLBACK route · CANCEL route · queueing (one build at a time, auto-start) · `/adlc-approved:` on sign-off · deploy stages (deploying, deploy-failed) in stage table · `phase` dropped from status.json contract · detail paraphrase rule · round caps and escalation menus now referenced, not restated · rendering tool named for cards · `stack` dropped from state block, `queued` added |
| adlc2-deploy-preview | **NEW** | The missing Phase 9: adlc-deploy.yml trigger, URL pattern, Vite `base` prerequisite + pre-build check, deploying/preview-deployed/deploy-failed stages, narration, failure handling (flag Saad — never auto-iterate), re-deploy semantics |
| adlc2-interview-user | replaced | Stack question removed (React-only) · delegated-decision rule ("you pick" → decide, recommend with rationale, record under Assumptions) |
| adlc2-write-spec | replaced | Stack field removed · Layout and Change log sections added to template · rollback re-entry gets fresh revision rounds |
| adlc2-wireframe-preview | replaced | Rendering tool named (inline widget — never paste HTML as text) · badge says "numbers are illustrative" · round-4 warning before the round-5 forced build · declared sole owner of round caps |
| adlc2-branch-management | replaced | Vite `base: '/adlc-dev/[slug]/'` made a scaffold requirement (fixes guaranteed blank-preview bug) · slug derivation points at the canonical algorithm · commits spec including Layout section |
| adlc2-read-standards | replaced | React-only (stack-specific rule list collapsed) |
| adlc2-code-generation | replaced | React-only · `detail` writing contract (plain words, no paths/codes) · implements Layout section |
| adlc2-validate-output | replaced | React-only (.NET/Java lines removed) · `detail` writing contract |
| adlc2-create-pr | replaced | Documents the full PR comment channel (/adlc-iterate, /adlc-approved, rollback notice) |
| adlc2-auto-iterate | replaced | Appends dated Change log entry to spec.md per iteration (audit trail) · escalation option (a) split: small change → iterate comment, spec-level → rollback · declared sole owner of escalation menu · clean narration matches deploy hand-off |

## 4. CI-side actions for Saad (not covered by skill files)

1. Create **adlc-deploy.yml** per adlc2-deploy-preview (trigger on clean,
   build, publish dist/ to gh-pages/[slug]/, write deploying →
   preview-deployed | deploy-failed, grep for the Vite base line first)
2. Update the scaffold template in adlc-generate.yml: add the `base` line to
   vite.config.ts; stop writing `phase` into status.json
3. Implement the canonical slug algorithm in the workflows exactly as written
   in adlc2-orchestrator (NFKD → hyphens → trim → 40-char word-boundary cut)
4. Claude Code prompt in CI: `detail` plain-words rule; append Change log
   entries on iterations
5. Teach the iterate workflow (or engineering convention) that
   `/adlc-approved:` is the merge signal and the rollback comment retires a PR

## 5. UPDATE (2026-06-11, after reading the real repo)

The actual workflows in saad-adlc/adlc-dev were reviewed; this changed the plan:
- **CI-PATCHES.md** (in this package) replaces README section 4 — it contains
  exact old→new blocks for adlc-generate.yml, adlc-iterate.yml, adlc-ci.yml,
  adlc-preview.yml, verified against current file SHAs.
- **adlc-signals.yml** (in this package) is the one NEW workflow — handles
  `/adlc-approved:` (label + confirm) and the rollback comment (auto-close PR).
- **Dropped:** the Vite `base` scaffold change (adlc-preview.yml already
  injects --base at build time) and the new adlc-deploy.yml (adlc-preview.yml
  IS Phase 9; it gets patched, not replaced).
- **Skills corrected to match reality:** adlc2-deploy-preview (real workflow
  name, previews/pr-[N]-[slug]/ URL pattern, build-time base), orchestrator
  (final slug algorithm + stage list), branch-management (base requirement
  removed), read-standards/validate-output (stage notes: phases 4–6 run
  inside the `generating` stage).
