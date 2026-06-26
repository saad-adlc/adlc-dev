#!/usr/bin/env bash
# WS11 — token/credit extractor for a gh-aw run (WS11 token calibration).
# A gh-aw run uploads a `usage` artifact containing */token_usage.jsonl, one JSON row
# per model request (input_tokens, output_tokens, cache_*, ai_credits_this_response).
# sum_tokens() (pure, TDD'd) sums those into "tokens_effective credits"; main() downloads
# the artifact for a run and prints the same. Fails soft: any problem -> "0 0", so the
# collector that calls this never breaks (a non-gh-aw run simply has no usage artifact).
#
# Usage: metrics-tokens.sh <run_id>    (env: GH_TOKEN, GITHUB_REPOSITORY or MX_REPO)
set -uo pipefail

sum_tokens() {  # gh-aw token_usage JSONL on stdin -> "tokens_effective credits"
  jq -s -r '
    ( (map(.input_tokens + .output_tokens) | add) // 0 ) as $t
    | ( ((map(.ai_credits_this_response) | add) // 0) * 10000 | round / 10000 ) as $c
    | "\($t) \($c)"
  '
}

# Let the TDD harness source sum_tokens() without running main().
case "${1:-}" in --source-only) return 0 2>/dev/null || exit 0 ;; esac

main() {
  local run="${1:?usage: metrics-tokens.sh <run_id>}"
  local repo="${MX_REPO:-${GITHUB_REPOSITORY:?metrics-tokens: repo required}}"
  for c in gh jq unzip; do command -v "$c" >/dev/null 2>&1 || { echo "0 0"; return 0; }; done
  local aid
  aid="$(gh api "repos/${repo}/actions/runs/${run}/artifacts" \
          --jq '.artifacts[]|select(.name=="usage")|.id' 2>/dev/null | head -1)"
  [ -n "$aid" ] || { echo "0 0"; return 0; }     # no usage artifact (e.g. a non-gh-aw run)
  local tmp; tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' RETURN
  gh api "repos/${repo}/actions/artifacts/${aid}/zip" > "$tmp/u.zip" 2>/dev/null \
    || { echo "0 0"; return 0; }
  unzip -o "$tmp/u.zip" -d "$tmp" >/dev/null 2>&1 || { echo "0 0"; return 0; }
  find "$tmp" -name token_usage.jsonl -exec cat {} + 2>/dev/null | sum_tokens
}

main "$@"
