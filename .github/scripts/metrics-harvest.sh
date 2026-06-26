#!/usr/bin/env bash
# WS11 — ADLC pipeline metrics harvester (Phase 1).
# Snapshots cross-run feature state (open/merged PRs, LOC, approval, age) that no
# single run owns. The pure transform snapshot_events() is TDD'd
# (test/metrics-harvest-tests.sh); the gh API call + sink in main() are live.
#
# Intended to run on a schedule. Emits one feature_snapshot event per ADLC PR.
# Read-only against GitHub (a token-authored read never triggers workflows).
set -uo pipefail

snapshot_events() {  # $1 = now (ISO-8601) ; reads a `gh pr list --json ...` array on stdin -> feature_snapshot JSONL
  local now="$1"
  jq -c --arg now "$now" '
    .[]
    | select((.headRefName // "") | test("^feature/issue-[0-9]+-"))
    | (.headRefName | capture("^feature/issue-(?<n>[0-9]+)-(?<slug>.+)$")) as $m
    | {
        schema_version: "1",
        event_type: "feature_snapshot",
        ts: $now,
        feature_key: ($m.n | tonumber),
        slug: ("issue-" + $m.n + "-" + $m.slug),
        pr_number: .number,
        state: (.state | ascii_downcase),
        loc_added: (.additions // 0),
        loc_removed: (.deletions // 0),
        created_at: .createdAt,
        merged_at: .mergedAt,
        approval: (if ((.labels // []) | map(.name) | index("adlc-approved")) then "approved" else "pending" end),
        age_days: (((($now | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 86400) | floor)
      }
  '
}

# Let the TDD harness source snapshot_events() without running main().
case "${1:-}" in --source-only) return 0 2>/dev/null || exit 0 ;; esac

main() {
  command -v jq >/dev/null 2>&1 || { echo "metrics-harvest: jq required" >&2; exit 2; }
  command -v gh >/dev/null 2>&1 || { echo "metrics-harvest: gh required" >&2; exit 2; }
  local repo="${MX_REPO:-${GITHUB_REPOSITORY:?metrics-harvest: repo required}}"
  local now; now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  local prs
  prs="$(gh pr list --repo "$repo" --state all --limit "${MX_PR_LIMIT:-100}" \
          --json number,headRefName,state,additions,deletions,createdAt,mergedAt,labels 2>/dev/null)" \
    || { echo "metrics-harvest: gh pr list failed" >&2; exit 2; }
  local events; events="$(printf '%s' "$prs" | snapshot_events "$now")"
  case "${MX_SINK:-file}" in
    stdout|adx) printf '%s\n' "$events" ;;
    file|*)
      local f="${MX_SINK_FILE:-${RUNNER_TEMP:-/tmp}/adlc-metrics.jsonl}"
      if [ -n "$events" ]; then printf '%s\n' "$events" >> "$f"; fi
      echo "metrics-harvest: $(printf '%s' "$events" | grep -c .) snapshots -> $f" >&2
      printf '%s\n' "$events" ;;
  esac
}

main "$@"
