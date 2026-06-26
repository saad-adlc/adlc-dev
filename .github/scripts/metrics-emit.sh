#!/usr/bin/env bash
# WS11 — ADLC pipeline metrics emitter (Phase 1).
# Assembles ONE structured, OTel-shaped JSON event per pipeline run from MX_* env
# and writes it to the configured sink. The pure assembler build_event() is TDD'd
# (test/metrics-emit-tests.sh); the sink in main() is pluggable — Phase 1 default
# appends to a JSONL log, Phase 2 swaps in an Azure Data Explorer POST — so the
# event shape never changes when the sink does.
#
# Inputs (env, MX_ prefix):
#   EVENT_TYPE (req)  FEATURE_KEY (req, int = issue #)  TS (req, ISO-8601)
#   SLUG  PHASE  RUN_ID  ENGINE  MODEL  TOKENS  CREDITS  CONCLUSION  ITERATION  DURATION
# Sink: MX_SINK = file (default) | stdout | adx   ·   MX_SINK_FILE = path for file sink
set -uo pipefail

build_event() {  # MX_* env -> one compact JSON line on stdout (fails closed on a bad/missing required field)
  jq -nc \
    --arg     schema     "1" \
    --arg     etype      "${MX_EVENT_TYPE:?metrics-emit: MX_EVENT_TYPE required}" \
    --arg     ts         "${MX_TS:?metrics-emit: MX_TS required}" \
    --argjson fkey       "${MX_FEATURE_KEY:?metrics-emit: MX_FEATURE_KEY required}" \
    --arg     slug       "${MX_SLUG:-}" \
    --arg     phase      "${MX_PHASE:-}" \
    --arg     run_id     "${MX_RUN_ID:-}" \
    --arg     engine     "${MX_ENGINE:-}" \
    --arg     model      "${MX_MODEL:-}" \
    --argjson tokens     "${MX_TOKENS:-0}" \
    --argjson credits    "${MX_CREDITS:-0}" \
    --arg     conclusion "${MX_CONCLUSION:-}" \
    --argjson iter       "${MX_ITERATION:-0}" \
    --argjson dur        "${MX_DURATION:-0}" \
    '{schema_version:$schema, event_type:$etype, ts:$ts, feature_key:$fkey,
      slug:$slug, phase:$phase, run_id:$run_id, engine:$engine, model:$model,
      tokens_effective:$tokens, credits:$credits, conclusion:$conclusion,
      iteration_n:$iter, duration_s:$dur}'
}

# Let the TDD harness source build_event() without running main().
case "${1:-}" in --source-only) return 0 2>/dev/null || exit 0 ;; esac

main() {
  command -v jq >/dev/null 2>&1 || { echo "metrics-emit: jq required" >&2; exit 2; }
  local event
  event="$(build_event)" || { echo "metrics-emit: failed to assemble event" >&2; exit 2; }
  case "${MX_SINK:-file}" in
    adx)
      # Phase 2: POST to ADX ingestion. Cluster not provisioned yet -> emit to stdout.
      echo "metrics-emit: MX_SINK=adx is Phase 2 (cluster not provisioned) — emitting to stdout" >&2
      printf '%s\n' "$event" ;;
    stdout)
      printf '%s\n' "$event" ;;
    file|*)
      local f="${MX_SINK_FILE:-${RUNNER_TEMP:-/tmp}/adlc-metrics.jsonl}"
      printf '%s\n' "$event" >> "$f" && echo "metrics-emit: appended -> $f" >&2
      printf '%s\n' "$event" ;;
  esac
}

main "$@"
