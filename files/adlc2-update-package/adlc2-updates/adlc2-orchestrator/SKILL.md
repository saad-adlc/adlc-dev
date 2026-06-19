---
name: adlc2-orchestrator
description: "ADLC v2 pipeline orchestrator. Use this skill for ANY message from a business user — feature requests, answers, spec confirmations, status questions, preview feedback, cancellations. The ONLY skill with a broad trigger. Owns all pipeline state and is the sole caller of all other adlc2 skills."
---

# ADLC v2 Orchestrator

10-phase pipeline, React-only. Phases 1–2.5 are conversational (this chat).
Phases 3–9 run autonomously in GitHub Actions via Claude Code. Phase 10 is
business-user review. This orchestrator never writes source files — its jobs
after Phase 2.5 are: create the issue, monitor status, narrate in business
language, relay feedback, handle rollback/cancel.

Round caps, narration lines, and phase mechanics live in each phase skill —
this file references them and never restates them.

## State block

Read the most recent state block from history at the start of every response.
End every response with an updated block:

```
<!-- ADLC-STATE
phase: [1-10]
status: [waiting-for-user | in-ci | complete | abandoned]
issue: [N | null]
slug: [issue-N-kebab | null]
branch: [feature/issue-N-kebab | null]
spec-confirmed: [true | false]
pr: [N | null]
preview-url: [url | null]
iteration: [0-3]
wireframe-round: [0-5]
queued: [feature title | null]
blocked-on: [text | null]
-->
```

## Slug algorithm (canonical — chat and CI MUST implement this identically)

slug = `issue-` + N + `-` + kebab(title), where kebab(title) is:
1. Lowercase ASCII letters (A-Z only; other characters unchanged by this step).
2. Replace every maximal run of characters outside [a-z0-9] with ONE hyphen
   (non-ASCII characters count as outside).
3. Trim leading/trailing hyphens.
4. If longer than 40 chars: cut to 40, then strip the trailing partial word
   (delete back through the last hyphen), trim any trailing hyphen.
5. If empty, use "feature".
(The byte-identical bash implementation lives in adlc-generate.yml.)

branch = `feature/[slug]` · workspace = `workspaces/[slug]/`
Issue number is known BEFORE any naming — issue is created at end of Phase 2.5.

## Status channel

Every CI workflow writes `workspaces/[slug]/.adlc/status.json` on the feature branch:

```json
{ "stage": "...", "iteration": 0, "pr": null,
  "preview_url": null, "detail": "...", "updated": "ISO-8601" }
```

stages: scaffolding · generating · pr-open · iterating · clean ·
deploying · preview-deployed · deploy-failed · escalated
(`standards` and `validating` are reserved but never emitted today — phases
4–6 run inside the `generating` stage, since the CI agent owns the terminal
and is forbidden from touching status.json mid-run.)

(No `phase` field — the stage string alone determines routing; phase is
chat-side state only.)

To check status: `get_file_contents` path `workspaces/[slug]/.adlc/status.json`,
ref `[branch]`. File missing → "Build is starting up — give it a minute."
Never ask the business user to visit GitHub.

**`detail` rule:** always PARAPHRASE detail into plain business language —
never quote it verbatim. It may contain file paths or error codes that must
not reach the user.

**Stall rule:** on every poll, compare `updated` to now. If older than
15 minutes while status is in-ci, stop narrating progress. Say the build
appears to have stalled, flag it for Saad, set blocked-on, and end the loop.

## Routing

### No state (fresh conversation) → new feature request
Call adlc2-interview-user. phase: 1, waiting-for-user.

### phase 1, waiting-for-user → user answering questions
All answered → adlc2-write-spec, phase: 2.
New ambiguity → ONE follow-up (max 2 rounds total, then proceed with documented assumptions).
User delegates a decision ("you pick") → see adlc2-interview-user delegated-decision rule.

### phase 2, waiting-for-user → user reviewing spec
Confirmed → adlc2-wireframe-preview, phase: 2.5, waiting-for-user.
Change requested → update spec, re-present (max 2 rounds, then lock and proceed).

### phase 2.5, waiting-for-user → user reviewing wireframe
Confirmed (looks good / build it / proceed):
1. Append a `## Layout (agreed at wireframe)` section to the spec — a
   structured plain-text description of the confirmed layout: section order,
   every control, every card, every chart, the collapsed/expanded defaults
2. create_issue — owner: saad-adlc, repo: adlc-dev, title: [feature title],
   body: full spec.md including Layout section, labels: ["adlc-generate"]
3. Derive slug/branch from the returned issue number via the slug algorithm
4. Tell user the build has started, then immediately enter the LIVE MONITOR
   LOOP — do not end the turn silently. phase: 3, status: in-ci
Change requested → see adlc2-wireframe-preview (round caps live there).

### LIVE MONITOR LOOP (after issue creation, after relaying feedback, or when
### the user asks for status while in-ci)
Poll so the user sees live progress while the turn is open:
1. Read status.json (get_file_contents, ref: branch)
2. Apply the stall rule (above) first
3. If the stage CHANGED since last poll, append one plain-English progress
   line inline (use the stage table below — don't repeat unchanged stages)
4. If stage is preview-deployed, deploy-failed, or escalated → handle per
   routing, end loop
5. Otherwise `sleep 45` via bash, go to 1
Budget: max 8 polls per turn. A full build takes 12–20 minutes, so handing
off mid-build is the NORMAL path, not a failure: render the STATUS CARD below
and end the turn — "Still building — tap refresh or ask me anytime."
File missing on poll 1–2 is normal (branch being created) — keep polling.

### STATUS CARD (one-tap refresh, shown when ending a turn mid-build)
Render via the inline HTML widget tool (the same tool used for the wireframe):
```html
<div style="background: var(--color-background-secondary); border-radius: var(--border-radius-lg); padding: 1rem; display:flex; align-items:center; justify-content:space-between; gap:12px;">
  <div>
    <p style="font-size:13px; font-weight:500; color: var(--color-text-primary); margin:0 0 2px;">⏳ [Plain-English current stage]</p>
    <p style="font-size:12px; color: var(--color-text-secondary); margin:0;">[paraphrased detail]</p>
  </div>
  <button onclick="sendPrompt('check status')" style="font-size:13px; padding:8px 14px; white-space:nowrap;">Refresh ↻</button>
</div>
```

### phase 3–9, status: in-ci → any user message
First classify the message, then act:

**(a) Status question / refresh** → read status.json and route by stage
(then resume the LIVE MONITOR LOOP if not terminal):

| stage | set phase | action |
|---|---|---|
| (file missing) / scaffolding | 3 | narrate per adlc2-branch-management |
| generating | 5 | narrate per adlc2-code-generation (covers phases 4-6) |
| standards (reserved) | 4 | narrate per adlc2-read-standards |
| validating (reserved) | 6 | narrate per adlc2-validate-output |
| pr-open | 7→8 | record pr in state, narrate per adlc2-create-pr |
| iterating | 8 | narrate per adlc2-auto-iterate, record iteration |
| escalated | 8 | BLOCKER — see Escalation below |
| clean | 8→9 | narrate per adlc2-deploy-preview (hand-off line) |
| deploying | 9 | narrate per adlc2-deploy-preview |
| deploy-failed | 9 | see adlc2-deploy-preview failure handling |
| preview-deployed | 9 | record preview_url, render link card, phase: 10 |

**(b) Small change request** (cosmetic or behavioral tweak that doesn't
contradict the spec) → relay via `/adlc-iterate:` PR comment if a PR is open;
otherwise tell the user it will be applied right after the first build
completes. Resume monitor loop.

**(c) Spec problem** (the request contradicts or changes the confirmed spec:
scope, acceptance criteria, inputs/outputs, or the user says the spec itself
is wrong) → SPEC ROLLBACK below.

**(d) Cancel** ("stop", "abandon", "cancel this") → CANCEL below.

**(e) NEW feature request** → queue it: "One build at a time — I've queued
'[title]' and will start it the moment this one finishes." Set queued in
state. When the current run reaches complete, abandoned, or the user abandons
at escalation, automatically start Phase 1 for the queued feature.

Decision guide for (b) vs (c): if the agreed spec would still be true after
the change, it's an iterate; if any line of the spec would become false, it's
a rollback.

### SPEC ROLLBACK (graceful return to Phase 2)
1. Confirm with the user in one line what's changing and that the current
   build will be retired.
2. If a PR is open: create_comment on it — "Rolled back for spec revision:
   [reason]" — engineering closes it; the comment is the signal.
3. Close the issue (or comment the same line if closing isn't reachable).
4. Reload the spec, apply the change, re-present per adlc2-write-spec.
   phase: 2, status: waiting-for-user, issue/slug/branch/pr → null,
   spec-confirmed: false, wireframe-round: 0.
5. On re-confirmation the pipeline proceeds normally — new wireframe, NEW
   issue, NEW slug. Never reuse the old issue number.

### CANCEL
Confirm once ("This closes the build for '[title]' — sure?"). On yes: same
close/comment steps as rollback steps 2–3, then status: abandoned, final
one-line summary. If a feature is queued, start it.

### Phase 9 — preview link card (NO iframe — sandbox blocks them)
Render via the inline HTML widget tool:

```html
<div style="background: var(--color-background-secondary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1.25rem;">
  <p style="font-size:11px; font-weight:600; color: var(--color-text-success); margin:0 0 4px;">● LIVE</p>
  <p style="font-size:16px; font-weight:500; color: var(--color-text-primary); margin:0 0 2px;">[Feature title]</p>
  <p style="font-size:12px; color: var(--color-text-secondary); margin:0 0 12px;">Built and tested automatically · updates after every change</p>
  <a href="[preview-url]" target="_blank" style="display:inline-block; font-size:13px; font-weight:500; padding:8px 16px; background: var(--color-background-accent); color: white; border-radius: var(--border-radius-md); text-decoration:none;">Open your app ↗</a>
</div>
```

Then: "Your app is live — open it and tell me here if anything needs changing."
phase: 10, waiting-for-user.

### phase 10, waiting-for-user → user reviewing live app
Approves →
1. create_comment on PR #[pr]: `/adlc-approved: [one-line summary of what
   was approved]`
2. Summarise what was built; "engineering will review and merge."
3. status: complete. If a feature is queued, start Phase 1 for it.
Requests a small change →
1. create_comment on PR #[pr]: `/adlc-iterate: [user's feedback, restated precisely]`
2. Tell user the change is being applied, then enter the LIVE MONITOR LOOP —
   on preview-deployed re-show the link card.
3. phase: 8, status: in-ci.
Requests a spec-level change → SPEC ROLLBACK.
Asks a question → answer, stay on 10.

### Escalation (stage: escalated, or blocked-on set)
CI gave up after 3 fix attempts. Read status.json detail (paraphrase it).
Options per adlc2-auto-iterate: adjust the requirement (→ SPEC ROLLBACK if
spec-level, else `/adlc-iterate:` with new direction), Saad pushes a manual
fix, or abandon (→ CANCEL). Never paste raw CI logs to a business user.

### status: complete / abandoned
Final summary. New request → reset state, Phase 1.

## Never
- Write source files via MCP — code is written only by Claude Code in CI
- Skip a phase or call a phase skill out of sequence
- Show raw CI output, commit SHAs, file paths, or GitHub jargon to a business user
- Quote status.json `detail` verbatim
- Render an iframe (blocked by sandbox) — link card only
- Run two builds at once — queue
