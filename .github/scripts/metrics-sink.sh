#!/usr/bin/env bash
# WS11 sink (Phase 1 default): write JSONL from stdin to a uniquely-named file on the
# `metrics` branch via the GitHub Contents API. A unique path per call means no SHA and
# no concurrent-append race (each run owns its file). Power BI / ADX can both read the
# branch; when ADX lands, swap this sink for an ADX ingest without touching the emitters.
#
# Usage:  <jsonl on stdin> | metrics-sink.sh <key>
#   env:  GH_TOKEN (pull-requests:read + contents:write) · GITHUB_REPOSITORY or MX_REPO
#         MX_METRICS_BRANCH (default: metrics) · MX_METRICS_DIR (default: data)
# Prereq: the `metrics` branch must exist (create once: an empty orphan branch).
set -uo pipefail

KEY="${1:?usage: metrics-sink.sh <key>}"
REPO="${MX_REPO:-${GITHUB_REPOSITORY:?metrics-sink: repo required}}"
BRANCH="${MX_METRICS_BRANCH:-metrics}"
DIR="${MX_METRICS_DIR:-data}"

DATA="$(cat)"
[ -n "$DATA" ] || { echo "metrics-sink: empty stdin — nothing to write" >&2; exit 0; }
command -v gh >/dev/null 2>&1 || { echo "metrics-sink: gh required" >&2; exit 2; }
command -v jq >/dev/null 2>&1 || { echo "metrics-sink: jq required" >&2; exit 2; }

# Validate every line is JSON before publishing (never write junk to the store).
while IFS= read -r line; do
  [ -z "$line" ] && continue
  printf '%s' "$line" | jq -e . >/dev/null 2>&1 || { echo "metrics-sink: non-JSON line, refusing to write" >&2; exit 2; }
done <<< "$DATA"

PATH_IN_REPO="${DIR}/${KEY}.jsonl"
B64="$(printf '%s\n' "$DATA" | base64 | tr -d '\n')"   # base64 -w0 is GNU-only; tr unwraps portably

if gh api --method PUT "repos/${REPO}/contents/${PATH_IN_REPO}" \
     -f message="metrics: ${KEY}" \
     -f branch="${BRANCH}" \
     -f content="${B64}" >/dev/null 2>/tmp/metrics-sink.err; then
  echo "metrics-sink: wrote ${PATH_IN_REPO} on ${BRANCH}" >&2
else
  echo "metrics-sink: PUT failed (does the '${BRANCH}' branch exist? create it once as an empty orphan)" >&2
  cat /tmp/metrics-sink.err >&2 || true
  exit 2
fi
