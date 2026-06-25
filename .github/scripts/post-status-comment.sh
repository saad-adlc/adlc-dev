#!/usr/bin/env bash
# WS10 — Upsert the single ADLC status comment on a PR (in place, marker-based).
# Replaces the old [skip ci] status.json branch commits so the PR head stays at the
# code commit (lets CI + business-approval become required checks). The dedicated
# preview comment stays separate (it carries the live URL).
#
# Usage: post-status-comment.sh <pr-number> <stage> <detail> [owner/repo]
# Requires: gh (GH_TOKEN with pull-requests:write), jq.
set -uo pipefail

MARKER='<!-- adlc-status -->'

render() {  # <stage> <detail> -> the status-card markdown (ending with the marker)
  local stage="$1" detail="$2"
  printf '### 🔄 ADLC status: `%s`\n\n%s\n\n_Updated automatically as the build progresses._\n\n%s\n' \
    "$stage" "$detail" "$MARKER"
}

find_marker_comment_id() {  # stdin: PR comments JSON -> id of the marker comment, else empty
  jq -r --arg m "$MARKER" '[.[] | select((.body // "") | contains($m))][0].id // empty'
}

# Allow the test harness to source the functions without running main.
case "${1:-}" in --source-only) return 0 2>/dev/null || exit 0 ;; esac

main() {
  local pr="${1:?usage: post-status-comment.sh <pr> <stage> <detail> [owner/repo]}"
  local stage="${2:?missing stage}" detail="${3:?missing detail}"
  local repo="${4:-${GITHUB_REPOSITORY:?missing repo}}"
  command -v gh >/dev/null 2>&1 || { echo "post-status-comment: gh required" >&2; exit 2; }
  command -v jq >/dev/null 2>&1 || { echo "post-status-comment: jq required" >&2; exit 2; }

  local body id
  body="$(render "$stage" "$detail")"
  id="$(gh api "repos/${repo}/issues/${pr}/comments" --paginate 2>/dev/null | find_marker_comment_id)"

  if [ -n "$id" ]; then
    gh api -X PATCH "repos/${repo}/issues/comments/${id}" -f body="$body" >/dev/null \
      && echo "post-status-comment: updated #${id} -> ${stage}"
  else
    gh api -X POST "repos/${repo}/issues/${pr}/comments" -f body="$body" >/dev/null \
      && echo "post-status-comment: created -> ${stage}"
  fi
}

main "$@"
