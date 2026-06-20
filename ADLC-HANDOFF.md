# ADLC — Agentic Development Lifecycle: Full Handoff

**Organisation:** Orix Corporation (`saad-adlc` GitHub org)  
**Repo:** `saad-adlc/adlc-dev`  
**Authenticated GitHub user:** `saad-vts`  
**Azure AI Foundry endpoint:** `orix-adastra-adlc.services.ai.azure.com`  
**Preview URL base:** `https://saad-adlc.github.io/adlc-dev/previews/`  
**Document purpose:** Full state transfer — everything a new agent, system, or engineer needs to continue or re-implement this pipeline from scratch.

---

## 1. What ADLC Is

ADLC is a 10-phase AI-driven development pipeline that lets a non-technical business user describe a web feature in plain language and receive a deployed, tested, reviewed React app — without ever touching GitHub, code, or a terminal.

The pipeline was built and iterated entirely through Claude.ai (claude.ai chat + skills). The current implementation is **ADLC v2**, running on:

- **Chat orchestration layer:** Claude.ai (this project) with 13 custom skills
- **CI execution layer:** GitHub Actions (three workflows)
- **Code-writing agent:** Claude Code (`claude` CLI), running inside CI jobs, calling Azure AI Foundry models
- **Preview hosting:** GitHub Pages (`gh-pages` branch of `adlc-dev`)
- **Stack:** React + TypeScript + Vite + Vitest + ESLint — every app, no exceptions

---

## 2. Repository Layout

```
saad-adlc/adlc-dev (main)
│
├── .github/
│   └── workflows/
│       ├── adlc-generate.yml   # Phase 3–7: scaffold + Claude Code + PR
│       ├── adlc-iterate.yml    # Phase 8: self-healing fix loop (max 3)
│       ├── adlc-ci.yml         # Phase 6: lint + test + build check on PRs
│       └── adlc-preview.yml    # Phase 9: Vite build → gh-pages deploy
│
├── workspaces/
│   └── [slug]/                 # one directory per feature
│       ├── spec.md             # committed from issue body at scaffold time
│       ├── package.json
│       ├── package-lock.json   # committed by CI (never via MCP — too large)
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── .eslintrc.cjs
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── [component].tsx / [component].test.tsx
│       └── .adlc/
│           └── status.json     # the single status channel between CI and chat
│
└── (root config files — untouched by any workspace CI step)
```

The `gh-pages` branch holds deployed preview artefacts:
```
gh-pages branch
└── previews/
    └── pr-[N]-[slug]/          # Vite dist output, one subdir per PR
        └── index.html + assets
```

---

## 3. Slug Algorithm (Canonical — must be identical in chat and CI)

Given an issue number `N` and title string `title`:

```
slug = "issue-" + N + "-" + kebab(title)

kebab(title):
  1. Lowercase ASCII letters only (A–Z → a–z; non-ASCII chars unchanged yet)
  2. Replace every maximal run of characters NOT in [a-z0-9] with ONE hyphen
     (non-ASCII characters count as outside the set)
  3. Trim leading and trailing hyphens
  4. If longer than 40 chars: cut at char 40, then delete back to the last
     hyphen, trim any trailing hyphen
  5. If result is empty, use "feature"

branch  = "feature/" + slug
workspace = "workspaces/" + slug + "/"
```

The bash implementation in `adlc-generate.yml` is the reference.  
**Chat and CI MUST produce byte-identical slugs or the status-poll path will 404.**

---

## 4. The 10-Phase Pipeline

### Phase 1 — Interview (conversational, chat)

The orchestrator asks 3–5 targeted questions in one message. Max 2 clarification rounds; after that, remaining gaps become documented assumptions. If the user delegates a decision ("you pick"), the agent makes the call and records it under Assumptions.

**Output:** Enough information to write a complete, unambiguous spec.

---

### Phase 2 — Spec (conversational, chat)

Written from interview answers using the canonical spec template:

```markdown
# Spec: [Feature Title]
**Date:** [today]
*(Issue, branch, and workspace are assigned automatically when the build starts.)*

## What we're building
[2-3 sentences]

## Acceptance criteria
1. [ ] [independently verifiable]

## Inputs and outputs
| Element | Type | Behaviour |

## Test requirements
- Unit tests for: [functions/components]
- Coverage: 80% lines minimum

## Assumptions
- [made on behalf of user]

## Out of scope
- [explicit exclusions]

## Layout (agreed at wireframe)
*(Appended by orchestrator at end of Phase 2.5)*

## Change log
*(Appended by CI — one dated entry per iteration)*
```

User can request revisions; max 2 rounds, then it locks.  
On confirmation → Phase 2.5.  
**No issue is created yet.**

---

### Phase 2.5 — Wireframe (conversational, chat)

A non-functional HTML wireframe rendered inline in chat. Shows every input, output, and control from the spec. Uses realistic placeholder values but is clearly badged "WIREFRAME — not working code."

Two buttons wired via `sendPrompt()`:
- `looks good, build it` — confirms and triggers Phase 3
- `I want to change something before building` — loops back for revision

Max 5 wireframe rounds. Round 4 warns "one more after this." Round 5 builds unconditionally.

**On confirm:**
1. Orchestrator appends a `## Layout (agreed at wireframe)` section to the spec — a plain-text description of the agreed layout (section order, every control, every card)
2. Creates GitHub issue: `saad-adlc/adlc-dev`, label `adlc-generate`, body = full spec.md including layout section
3. Derives slug/branch from the returned issue number
4. Enters the Live Monitor Loop

---

### Phase 3 — Scaffold (CI: adlc-generate.yml)

Triggered by the `adlc-generate` label on a new issue.

1. Derives slug/branch using the canonical algorithm
2. Creates `feature/[slug]` from main
3. Scaffolds `workspaces/[slug]/` — package.json, tsconfig, vite.config.ts, eslint config, index.html, src/main.tsx + App.tsx + test-setup
4. Runs `npm install`, commits `package-lock.json`
5. Commits `spec.md` from the issue body (Layout section included) — this is the audit trail
6. Writes `status.json`: `{ "stage": "scaffolding", ... }`

**status.json narration:** "Setting up the project workspace."

---

### Phase 4 — Standards (CI, inside the generating stage)

Claude Code reads `ADLC-STANDARDS.md` from the repo root before writing any code. Not a separate CI stage today — phases 4–6 all run inside the single `generating` stage because Claude Code owns the terminal and cannot update status.json mid-run.

---

### Phase 5 — Code Generation (CI: adlc-generate.yml, Claude Code)

Claude Code writes TDD-style:

1. **Tests first:** `[component].test.tsx` — happy path, error states, edge cases from spec. Uses `toBeInTheDocument()` not `toBeDefined()`. Financial values use `toBeCloseTo`. CSS Modules: assert via `toHaveAttribute('data-health', ...)` not `toHaveClass`.
2. **Implementation:** per spec + Layout section. Only inside `workspaces/[slug]/`.
3. **Quality bar:** no `any` without comment, no TODOs, files ≤300 lines, functions ≤40 lines, JSDoc on public functions, named constants, kebab-case filenames, banned packages (moment, full lodash), no secrets, no eval.
4. **Commits:** `feat([slug]): [what] (issue #[N])` / `test([slug]): [what] (issue #[N])`

`status.json` updated as: `stage: "generating"`, `detail` = plain-English description of what's being written ("the amortization engine", "the name greeting component") — never file paths or error codes.

**status.json narration:** "Writing your app — tests first, then code. Currently on: [paraphrased detail]."

---

### Phase 6 — Validate (CI, inside the generating stage)

Claude Code runs `npm run ci` locally before the PR. `npm run ci` is defined in package.json as:
```
eslint . && tsc --noEmit && vitest run --coverage
```

Coverage must be ≥80% lines. If any check fails, Claude Code self-heals before committing (distinct from Phase 8 — this is pre-PR).

---

### Phase 7 — Pull Request (CI: adlc-generate.yml)

CI opens the PR: `feature/[slug]` → `main`, title `feat: [spec title] (issue #[N])`.

PR body contains:
- Human-readable summary
- `Closes #[N]`
- Changes table (file → what changed)
- Tests table (test name → what it verifies)
- Validation checklist
- How-to-test steps
- Link to `spec.md`

`status.json` updated: `stage: "pr-open"`, `pr: [number]`.

**Orchestrator records `pr` in state. Never sends the business user to the PR.**

---

### Phase 8 — Auto-Iterate / Self-Healing (CI: adlc-iterate.yml)

Triggered by three events (all automatic):

| Trigger | Event source |
|---|---|
| CI fails on ADLC PR | `workflow_run: adlc-ci`, conclusion: `failure` |
| Reviewer requests changes | `pull_request_review` |
| Business-user feedback from chat | `issue_comment` starting `/adlc-iterate:` |

**Guards:** branch must start `feature/issue-` · iteration cap = 3 (counted from `iteration-` commits on the branch) · pushes use `ADLC_PAT` so CI re-triggers.

**Claude Code per iteration:**
- Read failure/comment → read current files → minimal fix (no refactors, no new deps) → run `npm run ci` locally → commit `fix([slug]): iteration-[N] — [what]` → push
- Appends a dated entry to `spec.md ## Change log`
- CodeQL: auto-fix HIGH/CRITICAL only; MEDIUM/LOW get a PR comment

`status.json` progression:
- `iterating` (N, plain-language detail)
- `clean` when all green → hands off to Phase 9
- `escalated` if cap hit or same check fails 3×

**On escalation (the only time CI talks back to the user):**  
Orchestrator reads paraphrased detail, presents three options:
- (a) Adjust the requirement — small tweak: `/adlc-iterate:` comment; spec-level: SPEC ROLLBACK
- (b) Saad pushes a manual fix
- (c) Abandon — CANCEL flow

---

### Phase 9 — Deploy Preview (CI: adlc-preview.yml)

Triggered when `adlc-ci` succeeds on an ADLC PR.

1. Writes `status.json`: `stage: "deploying"`
2. Builds with base path injected at build time: `npx vite build --base /adlc-dev/previews/pr-[N]-[slug]/`
3. Publishes `dist/` to `gh-pages` branch under `previews/pr-[N]-[slug]/`
4. Writes `status.json`: `stage: "preview-deployed"`, `preview_url: "https://saad-adlc.github.io/adlc-dev/previews/pr-[N]-[slug]/"`
5. Posts URL as a PR comment

URL is stable across iterations — Phase 10 change requests refresh the same link.

**On `deploy-failed`:** the app built and tested fine, only the Pages publish failed. Flag for Saad. Do NOT route to auto-iterate.

---

### Phase 10 — Review (conversational, chat)

Business user opens the live preview and gives feedback in chat.

| User action | Orchestrator action |
|---|---|
| Approves | `create_comment` on PR: `/adlc-approved: [summary]` → summarise, "engineering will review and merge" |
| Small change | `create_comment` on PR: `/adlc-iterate: [feedback restated precisely]` → resume monitor loop, re-show link on next deploy |
| Spec-level change | SPEC ROLLBACK |

---

## 5. Cross-Cutting Mechanics

### Status Channel

Every CI workflow writes/reads `workspaces/[slug]/.adlc/status.json` on the feature branch. This is the only communication channel between CI and the chat orchestrator.

```json
{
  "stage": "generating",
  "iteration": 0,
  "pr": null,
  "preview_url": null,
  "detail": "the name greeting component",
  "updated": "2025-06-01T14:32:00Z"
}
```

**Stages:** `scaffolding` · `generating` · `pr-open` · `iterating` · `clean` · `deploying` · `preview-deployed` · `deploy-failed` · `escalated`

**`detail` rule:** always paraphrase into plain business language — never quote verbatim. May contain file paths or error codes.

**Stall rule:** if `updated` is older than 15 minutes while status is `in-ci`, declare stalled, flag for Saad, set `blocked-on`, end the loop.

### Live Monitor Loop

After issue creation, after relaying feedback, or on any status question while `in-ci`:

1. Read `status.json` via `get_file_contents` (ref: branch)
2. Apply stall rule first
3. If stage changed since last poll, append one plain-English progress line
4. If terminal stage (`preview-deployed`, `deploy-failed`, `escalated`) → handle and end loop
5. `sleep 45` → go to step 1

Budget: max 8 polls per turn. A full build takes 12–20 minutes. Hand off with a status card is the normal path mid-build.

### Queue

One build at a time. A new feature request while `in-ci` is queued: "One build at a time — I've queued '[title]' and will start it the moment this one finishes." On current run reaching `complete`, `abandoned`, or user abandons at escalation → auto-start Phase 1 for the queued feature.

### SPEC ROLLBACK

When user's request contradicts or changes the confirmed spec:

1. Confirm in one line what's changing and that the current build will be retired
2. If PR open: `create_comment` — "Rolled back for spec revision: [reason]"
3. Close the issue
4. Reload spec, apply change, re-present per Phase 2
5. On re-confirmation: new wireframe, **new issue, new slug** — never reuse the old issue number

### CANCEL

Confirm once. On yes: same close/comment steps as rollback 2–3. If a feature is queued, start it.

### Orchestrator State Block

Appended to every response in the chat:

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

---

## 6. GitHub Secrets & Tokens Required

| Secret name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Code CLI authenticates to Foundry via this (see below) |
| `ADLC_PAT` | Fine-grained PAT used by Claude Code pushes so CI re-triggers (default `GITHUB_TOKEN` does not re-trigger workflows on self-push) |
| `GH_TOKEN` | Token for `gh` CLI calls (Pages deploy, PR creation) |

### Azure AI Foundry / Claude Code integration

Claude Code runs inside CI and is pointed at the Foundry endpoint:
```
ANTHROPIC_BASE_URL=https://orix-adastra-adlc.services.ai.azure.com
ANTHROPIC_API_KEY=[foundry-key-from-secret]
```
Claude Code sends requests to `claude-sonnet-4-6` (or whatever model alias Foundry exposes) through the Foundry proxy. This allows Orix to use enterprise Azure billing, data-residency controls, and audit logging while Claude Code behaves exactly as it would against Anthropic's API.

---

## 7. GitHub MCP Connector — Lessons Learned

These lessons were discovered the hard way during ADLC v2 development.

### Read vs Write permissions

- Read operations (`search_repositories`, `get_file_contents`, `list_branches`, `get_label`) succeed on public repos without any app installation on the owning account
- Write operations (`issue_write`, `create_comment`, `create_branch`) require the connector's GitHub App to be **explicitly installed on the owning org** (`saad-adlc`), not just the authenticated user's personal account (`saad-vts`)

### 403 "Resource not accessible by integration"

This error means the GitHub App backing the connector has not been installed on the org with the required scope, not a collaborator access problem. Adding `saad-vts` as a collaborator to the repo does not fix it.

### Token refresh

Adjusting the app's permissions or installing on a new org does not upgrade the active token. A full **disconnect → reconnect** cycle in Claude.ai settings is required to mint a new token.

### Searching org repos

`git:search_repositories` with `user:<username>` does not surface org-owned repos. Use `in:name [repo-name]` sorted by `updated` for reliable cross-account search.

### Comment-as-signal pattern

Because label manipulation on existing PRs was not reliably reachable via MCP during development, all CI triggers for Phase 8 and Phase 10 use **PR comments as signals**: `/adlc-iterate: ...` and `/adlc-approved: ...`. This is more robust than label-based triggers and preserves a readable audit trail.

---

## 8. Apps Built So Far

| App slug | Issue | Status | Notes |
|---|---|---|---|
| `hello-react` | Drafted, not filed | — | Spec completed; blocked on GitHub App installation on `saad-adlc` org before issue could be created. First test of the full pipeline. |

The `hello-react` spec: a live name-greeting input with "Hello, World!" fallback, React + TypeScript, component tests, ≥80% coverage, lint-clean.

---

## 9. What the Current Architecture Cannot Do (and Why We're Moving)

The current implementation has the chat layer (Claude.ai) as the orchestrator. This creates several constraints:

1. **Conversation-bound state** — the `<!-- ADLC-STATE -->` block lives in chat history. A new conversation loses state. Stateful pipelines need durable state.
2. **Manual orchestration** — Phase 1–2.5 requires a human to keep the Claude.ai tab open. The "headless" trigger (GitHub issue label) kicks off CI, but the pre-trigger phases are chat-dependent.
3. **Skill fragility** — skills are markdown files read into Claude's context. They work but are not versionable through a proper SDLC (no tests, no staging, no rollback).
4. **Single-user interface** — Claude.ai is Saad's interface. The pipeline cannot be triggered by other business users without sharing the Claude.ai project.
5. **No gating model** — approvals (spec confirm, wireframe confirm, Phase 10 review) are conversational, not auditable GitHub events.

---

## 10. Target Architecture: Gated Headless Agentic Workflows in GitHub

The goal is to move **all phases into GitHub** — no Claude.ai chat required to run a pipeline. The pipeline is triggered, gated, and observed entirely through GitHub Issues, Comments, and Actions.

### Core concept

Replace the chat orchestrator with a **GitHub App** or **GitHub Actions bot** that:
- Listens to issue/comment events
- Runs agentic phases as Actions jobs (calling Claude Code or the Foundry API directly)
- Posts structured status updates as issue/PR comments
- Requires explicit human approval comments to advance past gates

### Proposed gate model

| Gate | Current | Target |
|---|---|---|
| Spec confirmed | User types "yes" in Claude.ai | User comments `/adlc-confirm-spec` on the issue |
| Wireframe confirmed | User taps "Looks good" button | User comments `/adlc-confirm-wireframe` on the issue |
| Phase 10 approved | User says "looks good" in Claude.ai | User comments `/adlc-approve` on the PR |
| Phase 10 iterate | User describes change in Claude.ai | User comments `/adlc-iterate: [feedback]` on the PR |

### Proposed workflow structure

```
.github/workflows/
  adlc-intake.yml        # triggered by: issues opened → runs Claude Code interview agent
                         # posts Q&A as issue comment, waits for /adlc-answer: reply
  adlc-spec.yml          # triggered by: /adlc-answer: comment → writes spec as issue comment
                         # waits for /adlc-confirm-spec
  adlc-wireframe.yml     # triggered by: /adlc-confirm-spec → renders wireframe HTML as comment
                         # waits for /adlc-confirm-wireframe
  adlc-generate.yml      # triggered by: /adlc-confirm-wireframe → scaffold + code + PR (existing)
  adlc-iterate.yml       # triggered by: CI failure or /adlc-iterate: comment (existing)
  adlc-ci.yml            # triggered by: PR push (existing)
  adlc-preview.yml       # triggered by: adlc-ci success (existing)
```

### MCP → GitHub Enterprise

For the headless version, the orchestration calls that currently happen via the Claude.ai MCP connector will move to:

- **Claude Code** (running in CI) making direct GitHub API calls via the `gh` CLI or Octokit
- Or a **GitHub App** with a webhook handler (e.g. a small AWS Lambda or Azure Function) that receives events and triggers workflows

If using GitHub Enterprise MCP (as opposed to the public github.com connector), the configuration differs:
- Base URL: your GitHub Enterprise Server or GHES Cloud endpoint
- The MCP server for GitHub Enterprise: `https://[your-ghes-host]/api/mcp` (or the hosted `github-enterprise` MCP server URL configured with your PAT)
- Tool names are the same as the public connector but scoped to your enterprise

### State management without Claude.ai

Replace the `<!-- ADLC-STATE -->` comment block with:
- A **dedicated issue** per feature that serves as the pipeline state store (issue body edited by the bot on each phase transition)
- Or a `state.json` file alongside `status.json` in the workspace, committed by each phase transition
- Or a GitHub Actions environment variable file passed between jobs in the same workflow run

### Claude Code + Foundry in headless mode

No change needed here — Claude Code already runs headlessly in CI. The Foundry endpoint and key are injected as secrets. The only addition: the headless intake/spec/wireframe phases need to call either:
- Claude Code (`claude -p "..."`) for agentic multi-step tasks
- Or the Foundry REST API directly (`POST https://orix-adastra-adlc.services.ai.azure.com/v1/messages`) for single-shot generation tasks like writing a spec

---

## 11. Files to Carry Forward

Everything needed to bootstrap the new system:

| Source | Use |
|---|---|
| This document | Context for any new agent or engineer |
| `adlc-generate.yml` | Phase 3–7 CI — largely reusable as-is |
| `adlc-iterate.yml` | Phase 8 CI — largely reusable as-is |
| `adlc-ci.yml` | Phase 6 CI — reusable as-is |
| `adlc-preview.yml` | Phase 9 CI — reusable as-is |
| `adlc2-orchestrator/SKILL.md` | State machine logic — translate to headless bot logic |
| `adlc2-write-spec/SKILL.md` | Spec template + revision rules |
| `adlc2-wireframe-preview/SKILL.md` | Wireframe rules + round caps |
| `adlc2-auto-iterate/SKILL.md` | Escalation logic + iteration guards |
| `adlc2-code-generation/SKILL.md` | Claude Code coding standards + TDD rules |
| `adlc2-deploy-preview/SKILL.md` | URL pattern + deploy-failed handling |
| Section 5 above | Cross-cutting mechanics (slug, status, stall rule, queue) |
| Section 7 above | GitHub MCP/API lessons learned |

---

## 12. Invariants That Must Be Preserved

These rules must be maintained in any re-implementation:

1. **Slug algorithm must be byte-identical** between the issue-creation path and the CI scaffold path — or the status-poll will 404
2. **No source files from the orchestration layer** — code is written only by Claude Code in CI, never by the chat agent or bot
3. **One build at a time** — queue, never run two simultaneously
4. **`detail` in status.json is for CI internal use** — always paraphrase before surfacing to any user
5. **`ADLC_PAT` not `GITHUB_TOKEN` for Claude Code pushes** — default token does not re-trigger workflows on self-push
6. **Issue is created after wireframe confirm, not after spec confirm** — the layout section must be in the issue body so CI has it when committing spec.md
7. **Spec rollback always creates a new issue** — never reuse old issue numbers
8. **`deploy-failed` is not routed to auto-iterate** — it is a publishing infrastructure failure, not a code failure
9. **Wireframe uses `sendPrompt()`** for buttons, not form submits — the sandbox blocks form submits and iframes
10. **Preview link is always read from `status.json`**, never constructed by hand — the URL is set by CI and is authoritative

---

*End of handoff document — last updated June 2026*
