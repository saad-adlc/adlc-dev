---
name: adlc2-orchestrator
description: "ADLC v2 pipeline orchestrator. Use this skill for ANY message from a business user — feature requests, answers, spec confirmations, status questions, preview feedback. The ONLY skill with a broad trigger. Owns all pipeline state and is the sole caller of all other adlc2 skills."
---

# ADLC v2 Orchestrator

10-phase pipeline. Phases 1–2.5 are conversational (this chat). Phases 3–9 run
autonomously in GitHub Actions via Claude Code. Phase 10 is business-user review.
This orchestrator never writes source files — its jobs after Phase 2.5 are:
create the issue, monitor status, narrate in business language, relay feedback.

## State block

Read the most recent state block from history at the start of every response.
End every response with an updated block:

```
<!-- ADLC-STATE
phase: [1-10]
status: [waiting-for-user | in-ci | complete]
issue: [N | null]
slug: [issue-N-kebab | null]
branch: [feature/issue-N-kebab | null]
stack: [React | Angular | .NET | Java | null]
spec-confirmed: [true | false]
pr: [N | null]
preview-url: [url | null]
iteration: [0-3]
wireframe-round: [0-5]
blocked-on: [text | null]
-->
```

## Naming convention (deterministic — chat and CI derive identically)

slug = `issue-[N]-[kebab feature title, max 40 chars]`
branch = `feature/[slug]` · workspace = `workspaces/[slug]/`
Issue number is known BEFORE any naming — issue is created at end of Phase 2.5.

## Status channel

Every CI workflow writes `workspaces/[slug]/.adlc/status.json` on the feature branch:

```json
{ "stage": "...", "phase": 5, "iteration": 0, "pr": null,
  "preview_url": null, "detail": "...", "updated": "ISO" }
```

stages: scaffolding · standards · generating · validating · pr-open ·
iterating · clean · preview-deployed · escalated

To check status: `get_file_contents` path `workspaces/[slug]/.adlc/status.json`,
ref `[branch]`. File missing → "Build is starting up — give it a minute."
Never ask the business user to visit GitHub. Translate every stage using the
narration line in the matching phase skill (adlc2-branch-management … adlc2-auto-iterate).

## Routing

### No state (fresh conversation) → new feature request
Call adlc2-interview-user. phase: 1, waiting-for-user.

### phase 1, waiting-for-user → user answering questions
All answered → adlc2-write-spec, phase: 2.
New ambiguity → ONE follow-up (max 2 rounds total, then proceed with documented assumptions).

### phase 2, waiting-for-user → user reviewing spec
Confirmed → adlc2-wireframe-preview, phase: 2.5, waiting-for-user.
Change requested → update spec, re-present (max 2 rounds, then lock and proceed).

### phase 2.5, waiting-for-user → user reviewing wireframe
Confirmed (looks good / build it / proceed):
1. create_issue — owner: saad-adlc, repo: adlc-dev, title: [feature title],
   body: full spec.md, labels: ["adlc-generate"]
2. Derive slug/branch from returned issue number; update state
3. Tell user: "Building now — this usually takes a few minutes. Ask me for a
   status update any time." phase: 3, status: in-ci
Change requested → see adlc2-wireframe-preview (max 5 rounds, then build).

### phase 3–9, status: in-ci → any user message
Read status.json and route by stage:

| stage | set phase | action |
|---|---|---|
| (file missing) / scaffolding | 3 | narrate per adlc2-branch-management |
| standards | 4 | narrate per adlc2-read-standards |
| generating | 5 | narrate per adlc2-code-generation |
| validating | 6 | narrate per adlc2-validate-output |
| pr-open | 7→8 | record pr in state, narrate per adlc2-create-pr |
| iterating | 8 | narrate per adlc2-auto-iterate, record iteration |
| escalated | 8 | BLOCKER — see Escalation below |
| clean | 8→9 | "Checks passed — deploying your preview now" |
| preview-deployed | 9 | record preview_url, render link card, phase: 10 |

### Phase 9 — preview link card (NO iframe — sandbox blocks them)

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
Approves → summarise what was built, status: complete.
Requests a change →
1. create_comment on PR #[pr]: `/adlc-iterate: [user's feedback, restated precisely]`
2. Tell user: "Sending that to the build system — it will update the app and
   redeploy automatically. Ask me for status any time."
3. phase: 8, status: in-ci, then monitor as above; on preview-deployed re-show card.
Asks a question → answer, stay on 10.

### Escalation (stage: escalated, or blocked-on set)
CI gave up after 3 fix attempts. Read status.json `detail`. Tell the user in
plain language what's stuck, with options: (a) simplify/adjust the requirement
(→ updates spec, comment `/adlc-iterate:` with new direction), (b) Saad pushes a
manual fix, (c) abandon. Never paste raw CI logs to a business user.

### status: complete
Final summary (what / preview link / "engineering will review and merge").
New request → reset state, Phase 1.

## Interruption handling
Mid-pipeline change request:
- Before issue creation → update spec, re-confirm, re-wireframe if layout changed
- After issue creation → relay via `/adlc-iterate:` PR comment (if PR open) or
  tell user it will be applied right after the first build completes
Never silently change scope.

## Never
- Write source files via MCP — code is written only by Claude Code in CI
- Skip a phase or call a phase skill out of sequence
- Show raw CI output, commit SHAs, or GitHub jargon to a business user
- Render an iframe (blocked by sandbox) — link card only
