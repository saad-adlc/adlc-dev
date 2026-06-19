#!/usr/bin/env bash
# [local] TDD for adlc_slug — byte-identical to hand-rolled adlc-generate.yml.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
source "$HERE/../adlc-prep.sh" --source-only
PASS=0; FAIL=0
eq() { local exp="$1" got; got="$(adlc_slug "$2" "$3")"
  if [ "$got" = "$exp" ]; then PASS=$((PASS+1));
  else FAIL=$((FAIL+1)); echo "FAIL: slug($2,'$3')='$got' != '$exp'"; fi; }
eq "issue-1-add-hello-world-react-component"        1  "Add Hello World React Component"
eq "issue-10-canada-t4-tax-calculator-2025-ontario" 10 "Canada T4 Tax Calculator 2025 (Ontario)"
eq "issue-12-percentage-profit-calculator"          12 "Percentage Profit Calculator"
eq "issue-28-tip-calculator"                        28 "Tip Calculator"
eq "issue-9-feature"                                9  "!!! @@@ ###"
eq "issue-5-the-quick-brown-fox-jumps-over-the-lazy" 5 "The quick brown fox jumps over the lazy dog"
echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
