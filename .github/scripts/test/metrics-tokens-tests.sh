#!/usr/bin/env bash
# TDD harness for metrics-tokens.sh (WS11 token calibration). bash 3.2 compatible.
# Tests the PURE summariser sum_tokens(): gh-aw token_usage JSONL on stdin ->
# "tokens_effective credits". The artifact download in main() is integration-tested live.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../metrics-tokens.sh"
PASS=0; FAIL=0
ok(){ PASS=$((PASS+1)); }
no(){ FAIL=$((FAIL+1)); echo "FAIL: $1"; }
eq(){ [ "$2" = "$3" ] && ok || no "$1 (expected '$2', got '$3')"; }

# shellcheck disable=SC1090
source "$SCRIPT" --source-only 2>/dev/null \
  || { echo "FAIL: cannot source $SCRIPT (not implemented yet)"; echo "----"; echo "PASS=0 FAIL=1"; exit 1; }

# two requests -> tokens = (100+50)+(200+100)=450 ; credits = 1.5+2.5 = 4
TWO='{"input_tokens":100,"output_tokens":50,"cache_read_tokens":9,"cache_write_tokens":0,"ai_credits_this_response":1.5}
{"input_tokens":200,"output_tokens":100,"cache_read_tokens":0,"cache_write_tokens":0,"ai_credits_this_response":2.5}'
eq "sums input+output tokens and credits" "450 4" "$(printf '%s' "$TWO" | sum_tokens)"

# empty input -> "0 0" (a run with no model calls, e.g. detection-only)
eq "empty input -> 0 0" "0 0" "$(printf '%s' '' | sum_tokens)"

# credits keep up to 4 decimals (matches gh-aw's ai_credits granularity)
FRAC='{"input_tokens":10,"output_tokens":5,"ai_credits_this_response":0.9708}
{"input_tokens":1,"output_tokens":1,"ai_credits_this_response":0.1234}'
eq "credits to 4 decimals" "17 1.0942" "$(printf '%s' "$FRAC" | sum_tokens)"

# missing optional fields default to 0 (defensive against schema drift)
MISS='{"input_tokens":7,"output_tokens":3}'
eq "missing credits -> 0" "10 0" "$(printf '%s' "$MISS" | sum_tokens)"

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
