#!/usr/bin/env bash
# TDD harness for metrics-harvest.sh (WS11 Phase 1). bash 3.2 compatible.
# Tests the PURE transform snapshot_events() — GitHub PR-list JSON -> feature_snapshot
# JSONL. The gh API call + sink in main() are integration-tested live.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../metrics-harvest.sh"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); }
no(){ FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# shellcheck disable=SC1090
source "$SCRIPT" --source-only 2>/dev/null \
  || { echo "FAIL: cannot source $SCRIPT (not implemented yet)"; echo "----"; echo "PASS=0 FAIL=1"; exit 1; }

# slurpok <name> <filter> — slurp the JSONL output ($OUT) into an array, assert the filter
slurpok(){ printf '%s' "$OUT" | jq -s -e "$2" >/dev/null 2>&1 && ok || no "$1"; }

NOW=2026-06-26T12:00:00Z
INPUT='[
  {"number":55,"headRefName":"feature/issue-54-unit-converter","state":"OPEN","additions":120,"deletions":5,"createdAt":"2026-06-21T12:00:00Z","mergedAt":null,"labels":[{"name":"adlc-generated"}]},
  {"number":61,"headRefName":"feature/issue-60-net-worth","state":"MERGED","additions":80,"deletions":2,"createdAt":"2026-06-25T12:00:00Z","mergedAt":"2026-06-26T00:00:00Z","labels":[{"name":"adlc-generated"},{"name":"adlc-approved"}]},
  {"number":99,"headRefName":"docs/some-plan","state":"OPEN","additions":3,"deletions":0,"createdAt":"2026-06-26T00:00:00Z","mergedAt":null,"labels":[]}
]'
OUT="$(printf '%s' "$INPUT" | snapshot_events "$NOW")" || no "snapshot_events exited non-zero"

slurpok "skips non-feature branches (2 of 3)" 'length==2'
slurpok "all events are feature_snapshot"      'all(.event_type=="feature_snapshot")'
# first feature (open, awaiting approval)
slurpok "feature_key parsed as number"  '.[0].feature_key==54 and (.[0].feature_key|type=="number")'
slurpok "slug reconstructed"            '.[0].slug=="issue-54-unit-converter"'
slurpok "pr_number"                     '.[0].pr_number==55'
slurpok "state open"                    '.[0].state=="open"'
slurpok "loc_added"                     '.[0].loc_added==120'
slurpok "loc_removed"                   '.[0].loc_removed==5'
slurpok "approval pending"              '.[0].approval=="pending"'
slurpok "age_days = 5"                  '.[0].age_days==5'
# second feature (merged + approved)
slurpok "merged state"                  '.[1].state=="merged"'
slurpok "approved when labelled"        '.[1].approval=="approved"'
slurpok "feature_key 60"                '.[1].feature_key==60'

# empty input -> no events, clean exit
OUT="$(printf '%s' '[]' | snapshot_events "$NOW")" || no "empty input should exit 0"
slurpok "empty input -> 0 events"       'length==0'

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
