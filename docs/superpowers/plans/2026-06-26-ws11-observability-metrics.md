# WS11 — Pipeline Observability & Metrics — Implementation Plan

**Date:** 2026-06-26 · **Branch:** `adlc-dev@feature/ws11-observability-plan` · **Status:** planned
**Goal:** Make the ADLC pipeline measurable for analysts — token/cost usage, throughput, reliability, and gate state — with a small set of alerts to keep token spend in check. Reuse what gh-aw and GitHub already emit; add only what is genuinely missing.

## Problem
We run an autonomous pipeline that spends model tokens and produces features, but today there is **no aggregate view**: no one can answer "how many tokens did this feature cost", "what is our daily spend", "how many PRs are open or stuck", or "is the failure rate climbing". Cost control exists only as gh-aw's hard per-run / daily AI-credit caps; there is no trend, no per-feature attribution surfaced, and no alerting an analyst can act on.

## Locked decisions (grill, 2026-06-26)
- **Token/cost source — both, joined per feature.** Use gh-aw's per-run numbers (already emitted, per-feature) **and** Azure Foundry's authoritative billed usage, reconciled on a feature key. gh-aw gives fast per-feature attribution; Foundry gives the real cost.
- **Stack — events → Azure Data Explorer (ADX) → Power BI / ADX dashboards + ADX alerts.** A tiny emitter on the existing workflows writes one structured event per run; events land in ADX (KQL, native alerting); analysts get a Power BI dashboard over ADX. **OpenTelemetry is deferred** (gh-aw ships none; it would be net-new) but the **event schema is shaped OTel-style** so the transport can be swapped later without reshaping data.
- **Alerts — all four:** per-feature token ceiling · daily/weekly spend over budget · reliability spike (CI-failure rate / escalations) · aging PRs & stuck gates.

## The unit of analysis: a "feature"
One **feature** = one issue (`#N`) → one branch (`feature/issue-N-slug`) → one PR. The **correlation key is the issue number** (with the slug as a human label). Every event carries `feature_key` so tokens, lines of code, iterations, gate state, and cost all roll up per feature.

## Source map — what is reused vs net-new
| Metric | Source | Status |
|---|---|---|
| Tokens / AI-credits per run | gh-aw run outputs (`*_total_effective_tokens`), `GH_AW_INFO_*` summary, per-run artifact | **reuse** |
| Authoritative billed tokens + $ | Azure Foundry resource (`orix-adastra-adlc`) → Azure Monitor diagnostic settings | net-new (Azure wiring) |
| Features started | GitHub issues labelled `adlc-generate` | reuse (API) |
| PRs opened / merged / open | GitHub PRs (label `adlc-generated`, state, merged_at) | reuse (API) |
| Iterations per feature | count of `iteration-` commits since `main` on the branch | reuse (API/git) |
| Failures | workflow run conclusions (`ADLC — CI`, `ADLC Generate`, …) | reuse (API) |
| Escalations | `escalated` status stage / iterate cap-3 hits | reuse (API) |
| Gate state | the `<!-- adlc-status -->` comment stage + required-check status | reuse (API) |
| Lines of code | PR diff stats (additions/deletions) | reuse (API) |
| Coverage % | `coverage-summary.json` from the CI run | reuse (artifact) |
| OpenTelemetry transport | — | **deferred** (greenfield) |

## Architecture (emit → store → visualize → alert)
```
 GitHub Actions (existing workflows)        Azure Foundry (orix-adastra-adlc)
   │  per-run "metrics emitter" step          │  diagnostic settings
   │  → one JSON event / run                   │  → token + cost per request
   ▼                                           ▼
 [ scheduled GitHub harvester ] ── events ──▶  AZURE DATA EXPLORER (ADX)
   (PRs/issues/LOC/gate snapshots)             tables: PipelineRuns · FeatureSnapshots · FoundryUsage
                                               KQL views: FeatureRollup · CostTrend · ReliabilityRollup
                                                 │                         │
                                                 ▼                         ▼
                                         Power BI dashboard          ADX alert rules (×4)
                                         (analyst-facing)            → email / Teams / webhook
```

Three producers:
1. **Per-run emitter** (composite action appended to each ADLC workflow tail). After a run it assembles the structured event from data already present (gh-aw outputs, run metadata) and ingests it into ADX `PipelineRuns`. Covers tokens/credits, model, conclusion, duration, iteration number, per run.
2. **Scheduled harvester** (a cron workflow, ~hourly). Queries the GitHub API for the slower, cross-run state — open PRs, merged PRs, issue states, PR diff LOC, gate/stage, aging — and writes snapshot rows to `FeatureSnapshots`. Covers throughput + gate metrics that are not tied to a single run.
3. **Foundry → Azure Monitor → ADX** (`FoundryUsage`). Authoritative billed tokens + cost per model request for the Orix Foundry resource.

## Event schema (OTel-shaped, transport-agnostic)
```jsonc
{
  "schema_version": "1",
  "event_type": "pipeline_run | feature_snapshot | foundry_usage",
  "ts": "<ISO-8601>",
  "feature_key": 57,                 // issue number — the join key
  "slug": "issue-57-balance-sheet",
  "phase": "generate | ci | iterate | preview | review",
  "run_id": "<actions run id>",
  "engine": "gh-aw | legacy",
  "model": "claude-sonnet-4-6",
  "tokens_effective": 0,             // gh-aw view
  "credits": 0,
  "conclusion": "success | failure | skipped | escalated",
  "iteration_n": 0,
  "duration_s": 0,
  "loc_added": 0, "loc_removed": 0,  // snapshot events
  "stage": "preview-deployed",       // status-comment stage
  "approval": "pending | approved",
  "cost_usd": 0.0                     // foundry_usage events
}
```

## Joining gh-aw ↔ Foundry (the one hard part)
Foundry meters per **request**, not per feature, so usage must be attributed back to a run.
- **Preferred — request tagging.** Tag each model call routed through `ANTHROPIC_BASE_URL` with the `run_id`/`feature_key` (custom header or metadata, if gh-aw / the api-proxy allows it). Then `FoundryUsage` joins exactly on `feature_key`. **(Spike task — verify feasibility first.)**
- **Fallback — time-window correlation.** Attribute Foundry usage to the run whose `[started, ended]` window + model it falls in. Good enough when runs do not overlap; `adlc-iterate` is already serialized (concurrency group), but generates across different features can overlap, so flag this as approximate and reconcile against gh-aw's per-run number as a cross-check.

## Metrics catalog (v1)
- **Cost/usage:** tokens & credits per run / per feature / total / 7-day trend · est. $ per feature (Foundry) · tokens split by phase (generate vs iterate vs review) · gh-aw-vs-Foundry reconciliation delta.
- **Throughput:** features started · PRs opened / merged / open · lead time (issue → merge) · previews deployed.
- **Reliability:** CI pass/fail rate · iterations per feature (avg & max) · escalations (cap-3 hits) · deploy-failed count · coverage % per feature.
- **Gate state:** current stage per open feature · approval pending vs approved · required-check status · age at gate.
- **Efficiency:** tokens per merged feature · tokens per LOC · % of features that needed an iteration.

## Alerts (ADX rules, all four)
| Alert | Rule (KQL, thresholds as repo vars) | Why |
|---|---|---|
| Per-feature token ceiling | a `feature_key`'s summed `tokens_effective` > `FEATURE_TOKEN_MAX` | runaway generation / iterate loop |
| Daily/weekly spend | windowed sum of credits/$ > `DAILY_SPEND_MAX` | budget visibility above gh-aw's hard cap |
| Reliability spike | CI-failure rate or escalation count in window > threshold | pipeline degrading |
| Aging PR / stuck gate | open PR or `approval=pending` age > `GATE_SLA_DAYS` | work piling at a gate |

## Tasks (phased)
0. **Foundations.** Finalize the event schema; provision the ADX cluster + DB + the three tables + ingestion auth (a service principal / managed identity); store thresholds as repo variables.
1. **GitHub-side emit.** Build the reusable **metrics-emitter** composite action; wire it into the tails of `adlc-generate` / `adlc-ci` / `adlc-iterate` / `adlc-preview`. Build the **scheduled harvester** workflow. Land `PipelineRuns` + `FeatureSnapshots`.
2. **Foundry cost.** Wire Foundry diagnostic settings → ADX `FoundryUsage`. **Spike** request-tagging; if infeasible, implement the time-window join. Reconcile per feature.
3. **Dashboards.** KQL views (`FeatureRollup`, `CostTrend`, `ReliabilityRollup`); a Power BI dashboard over ADX for analysts + a quick ADX dashboard.
4. **Alerts.** The four ADX alert rules + routing (email/Teams/webhook). Validate each on a synthetic breach.

## Acceptance
- A dashboard shows tokens **per feature** and totals, plus features started / PRs opened-merged-open / iterations / failures / current gate state, refreshed at least hourly.
- gh-aw and Foundry token numbers are reconciled per feature within a stated tolerance (and the delta is itself visible).
- All four alerts fire on a synthetic breach and route to a real channel.
- Zero PII / secrets land in ADX (events carry IDs and counts, never code or user content).

## Risks / open questions
- **The gh-aw↔Foundry join.** Request-tagging may not be exposed; the time-window fallback is approximate under overlapping generates. *Mitigation:* spike tagging first; otherwise show both numbers and the delta rather than a single "truth".
- **ADX standing cost/ops.** A cluster has a baseline cost; for low volume a dev-tier cluster or Log Analytics may be cheaper. *Decide at task 0.*
- **Emitter must never block the build.** The emit step is best-effort (`continue-on-error`), so a metrics outage never fails a feature build.
- **Harvester identity.** Reuse `ADLC_AGENT_TOKEN` for GitHub reads; note that token-authored actions do not trigger workflows (irrelevant for read-only harvest, but keep it read-only).
- **Phase-2 dependency.** Foundry diagnostic settings are an Azure-admin action outside the repo — treat as a real prerequisite, like the connector install.

## Out of scope (v1)
Full OpenTelemetry instrumentation/traces; cross-repo (multi-project) rollups; cost forecasting/anomaly-ML; the legacy-engine deep metrics (it is the fallback). Schema is OTel-shaped to keep these open.
