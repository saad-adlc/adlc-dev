# WS7 Design Note — What Makes the Pipeline Look "Live" in the UI

**Date:** 2026-06-19 · **Status:** design input for WS7 (intent capture / claude.ai skill) · **Repo/branch:** captured on `adlc-dev@ws-doc9-impl`
**Relates to:** PLAN.md §WS7, the WS2/3/4 status.json decision (grill Q1), and `2026-06-19-ws2-3-4-ghaw-spine.md` Task 7.

---

## Core principle

**"Live in the UI" is a consumer-side property, not a CI-side one.** The business user only ever sees **claude.ai chat** — never GitHub. So the live feel is produced by the **ADLC skill's monitor loop** that polls an observable signal and narrates it. CI emitting status is necessary but never sufficient: without a poller rendering it, nothing reaches the user.

This means the "live UI" is a **WS7 deliverable** (the polling skill), fed by signals that WS2/WS3 emit. The two must be designed together.

## The live engine (WS7 must implement this)

After the skill creates the labelled `adlc-generate` issue, it runs a **monitor loop**:

1. Poll an observable signal every ~45s via the GitHub MCP connector.
2. On each **state change**, render **one plain-English progress line** (from the paraphrased `detail` — "Writing your app, tests first," never `vitest --coverage`).
3. On a terminal state, render the payoff and stop.

Three things make it *feel* live rather than mechanical:
- **State changes during the build** (so each poll has something new).
- **Plain-English narration** (business language, no file paths / error codes / tool names — HANDOFF §5 `detail` rule).
- **A clickable payoff** — the GitHub Pages preview URL surfaced in chat.

**Bounded by claude.ai's turn model:** the skill polls a handful of times per turn (~8 × 45s ≈ 6 min — HANDOFF §5 "Live Monitor Loop", budget 8 polls/turn), then hands off a **status card**; the user asking "how's it going?" triggers the next round. It is *progress narration + status cards*, not a streaming console. A full build is 12–20 min, so handing off a status card mid-build is the normal path.

## Signal timeline — and the key insight

The poller can watch two kinds of signal, covering different parts of the timeline:

| Build phase (~clock) | Live signal | UI line the user sees |
|---|---|---|
| issue labeled (0:00) | label / `status: scaffolding` | "Setting up the workspace…" |
| generating (0:02–0:15) | **`status: generating`** ← *needs mid-run status push (WS2 Q1)* | "Writing your app — tests first, then code…" |
| PR opened (~0:15) | **PR exists** (native event) / `status: pr-open` | "Built and packaged — automated checks running" |
| CI running (0:15–0:18) | **check runs** (native event) | "Running quality checks…" |
| green → preview (0:18–0:20) | preview workflow / `status: preview-deployed` | "Ready — here's your live preview: ‹link›" |
| iterate (on feedback) | `status: iterating` / new check runs | "Making that change — attempt N of 3…" |
| escalated (cap hit) | `status: escalated` | "I've hit a limit fixing this — engineering will step in." |

**Key insight:** everything from **PR-opened onward** is observable through **native GitHub events** (PR exists → check runs → checks green → Pages deployment) that occur on their own, spaced across the build. The poller gets that liveness **for free**. The **only** phase that genuinely needs WS2's mid-run `status.json` pushes is **"generating"** — the ~13 minutes before the PR exists, where no native signal is yet visible.

So the WS2 live-status engineering (grill Q1) buys exactly one thing in the UI: the **early-phase narration** ("Writing your app…") during the first ~15 minutes. The PR→preview payoff — the part users care most about — is carried by native events regardless.

## What WS7 should poll (recommendation)

Poll a **blend**, preferring native events for robustness:
- **Pre-PR (`scaffolding`/`generating`):** WS2 (per the source review) commits `scaffolding` into the agent's commit, so it only appears at PR time — **not live**. The feature branch cannot carry live pre-PR status because `create-pull-request` rebuilds it from a bundle (an early push would be excluded and ship a scaffold-less PR). For *live* pre-PR narration, use a **decoupled channel** that doesn't touch the feature branch: gh-aw's **activation status comment** (`add-comment` with `target: status`, which gh-aw can update in place), or a dedicated CI-edited issue comment, or skill-side elapsed-time narration. Until one is built, this phase shows "Setting up…" until the PR appears — acceptable.
- **PR-open → preview:** read **native signals** — PR existence (by head branch `feature/issue-<N>-<slug>`), check-run conclusions, and the preview comment / Pages deployment. These don't depend on status.json at all.
- **Preview link:** always read from `status.json.preview_url` (HANDOFF §12.10 — the URL is authoritative, never hand-constructed) or the preview PR comment.

This makes the live UI **resilient to the WS2 status decision**: full status.json gives the richest narration; native-event polling alone still produces a live PR→preview experience.

## Interaction with WS2 (Q1 → resolved after source review)

The gh-aw source review **confirmed** the early-push-to-feature-branch mechanism is incompatible with `create-pull-request` (it bundles `origin/<branch>..<branch>`, so early-pushed commits are excluded → a scaffold-less PR). So **WS2 generate uses Fallback B = reduced branch status** (`scaffolding` appears at PR time, then `pr-open`). The UI **still looks live from PR-open onward** via native events; the only thing the branch can't provide is the "Writing your app…" narration in the first ~15 min.

**Therefore live pre-PR narration, if wanted, is a WS7 responsibility via the decoupled channel above — never the feature branch.** WS7's native-event polling remains the load-bearing part of liveness; the decoupled pre-PR channel is an optional enhancement, not a prerequisite for a live-feeling UI. (Iterate is different: `iterating`/`escalated` *are* live on the branch, because `push-to-pull-request-branch` appends to the existing PR branch rather than rebuilding it.)

## WS7 acceptance additions (live-UI specific)

Beyond PLAN §WS7's existing AC (interview → Artifacts preview → labelled issue), the live UI is "done" when:
1. From a fresh claude.ai chat, after the issue is created, the skill **narrates ≥3 distinct progress lines** across a real build (e.g. setup → checks → preview), each in plain business language.
2. The skill surfaces the **clickable Pages preview** read from the authoritative `preview_url`.
3. On `escalated`/`deploy-failed`, the skill **stops the loop** and gives the user the right next action (HANDOFF §5 terminal-stage handling), not an endless "still working."
4. Liveness degrades gracefully: with only native events available (no mid-run status), the skill still produces a live PR→preview progression.

## Out of scope (here)

The skill packaging, the grill-me/handoff bootstrap, and the MCP connector install remain as in PLAN §WS7 / INFRA §C/§I. This note only specifies the **live-progress** behavior and its signal dependencies.
