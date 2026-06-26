#!/usr/bin/env bash
# TDD harness for metrics-emit.sh (WS11 Phase 1). bash 3.2 compatible.
# Tests the PURE assembler build_event(); the sink/IO in main() is integration-
# tested live (it writes to the configured sink). Mirrors status-comment-tests.sh.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../metrics-emit.sh"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); }
no(){ FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# shellcheck disable=SC1090
source "$SCRIPT" --source-only 2>/dev/null \
  || { echo "FAIL: cannot source $SCRIPT (not implemented yet)"; echo "----"; echo "PASS=0 FAIL=1"; exit 1; }

# jqok <name> <filter> — assert the build_event output ($OUT) satisfies the jq filter
jqok(){ printf '%s' "$OUT" | jq -e "$2" >/dev/null 2>&1 && ok || no "$1"; }

# --- happy path: a fully-populated pipeline_run event ---
MX_EVENT_TYPE=pipeline_run
MX_FEATURE_KEY=57
MX_SLUG=issue-57-balance-sheet
MX_PHASE=generate
MX_RUN_ID=123
MX_ENGINE=gh-aw
MX_MODEL=claude-sonnet-4-6
MX_TOKENS=12345
MX_CREDITS=42
MX_CONCLUSION=success
MX_ITERATION=0
MX_DURATION=600
MX_TS=2026-06-26T00:00:00Z
OUT="$(build_event)" || no "happy path exited non-zero"
jqok "output is valid JSON"        '.'
jqok "event_type"                  '.event_type=="pipeline_run"'
jqok "schema_version"              '.schema_version=="1"'
jqok "feature_key is a number"     '.feature_key==57 and (.feature_key|type=="number")'
jqok "slug preserved"              '.slug=="issue-57-balance-sheet"'
jqok "phase preserved"             '.phase=="generate"'
jqok "tokens_effective is number"  '.tokens_effective==12345 and (.tokens_effective|type=="number")'
jqok "credits is number"           '.credits==42 and (.credits|type=="number")'
jqok "conclusion"                  '.conclusion=="success"'
jqok "ts preserved"                '.ts=="2026-06-26T00:00:00Z"'
jqok "single line (no newline in body)" '.'   # jq -e already rejects multi-object output

# --- defaults: optional numerics -> 0, optional strings -> "" ---
unset MX_TOKENS MX_CREDITS MX_ITERATION MX_SLUG MX_PHASE
MX_EVENT_TYPE=pipeline_run
MX_FEATURE_KEY=58
MX_RUN_ID=9
MX_ENGINE=gh-aw
MX_MODEL=claude-sonnet-4-6
MX_CONCLUSION=failure
MX_DURATION=10
MX_TS=2026-06-26T00:00:00Z
OUT="$(build_event)" || no "defaults path exited non-zero"
jqok "tokens default 0"    '.tokens_effective==0'
jqok "credits default 0"   '.credits==0'
jqok "iteration default 0" '.iteration_n==0'
jqok "slug default empty"  '.slug==""'

# --- fail-closed: a missing required field (feature_key) must error, not emit junk ---
if ( unset MX_FEATURE_KEY; MX_EVENT_TYPE=pipeline_run MX_TS=2026-06-26T00:00:00Z build_event >/dev/null 2>&1 ); then
  no "missing feature_key should exit non-zero"
else
  ok
fi

# --- feature_key must be numeric (it is the issue number / join key) ---
if ( MX_FEATURE_KEY=not-a-number MX_EVENT_TYPE=pipeline_run MX_TS=x build_event >/dev/null 2>&1 ); then
  no "non-numeric feature_key should exit non-zero"
else
  ok
fi

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
