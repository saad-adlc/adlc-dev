#!/usr/bin/env bash
# TDD harness for post-status-comment.sh (WS10). bash 3.2 compatible.
# Tests the PURE functions (render + find_marker_comment_id); the gh I/O in main()
# is verified live by the WS10 test-generate (plan task 4).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../post-status-comment.sh"
PASS=0; FAIL=0

# shellcheck disable=SC1090
source "$SCRIPT" --source-only 2>/dev/null || { echo "FAIL: cannot source $SCRIPT"; echo "----"; echo "PASS=0 FAIL=1"; exit 1; }

ok() { PASS=$((PASS+1)); }
no() { FAIL=$((FAIL+1)); echo "FAIL: $1"; }
has() { printf '%s' "$2" | grep -qF -- "$3" && ok || no "$1 (missing '$3')"; }
eq()  { [ "$2" = "$3" ] && ok || no "$1 (expected '$2', got '$3')"; }

# --- render(stage, detail) ---
out="$(render "preview-deployed" "Your live preview is ready")"
has "render shows stage"   "$out" "preview-deployed"
has "render shows detail"  "$out" "Your live preview is ready"
has "render embeds marker" "$out" "<!-- adlc-status -->"

# --- find_marker_comment_id (stdin: PR comments JSON) -> marker comment id or empty ---
both='[{"id":11,"body":"hello"},{"id":42,"body":"card x <!-- adlc-status --> y"},{"id":43,"body":"<!-- adlc-status -->"}]'
eq "find returns first marker id" "42" "$(printf '%s' "$both" | find_marker_comment_id)"
none='[{"id":1,"body":"no marker here"},{"id":2,"body":"plain comment"}]'
eq "find empty when absent"       ""   "$(printf '%s' "$none" | find_marker_comment_id)"
eq "find empty on empty list"     ""   "$(printf '%s' '[]'   | find_marker_comment_id)"

echo "----"; echo "PASS=$PASS FAIL=$FAIL"; [ "$FAIL" -eq 0 ]
