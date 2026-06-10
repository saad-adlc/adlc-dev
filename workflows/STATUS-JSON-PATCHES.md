# status.json — patches for existing workflows

Single status channel read by chat via MCP `get_file_contents`
(path `workspaces/[slug]/.adlc/status.json`, ref = feature branch).

Schema:
{ "stage": "scaffolding|standards|generating|validating|pr-open|iterating|clean|preview-deployed|escalated",
  "phase": 3-9, "iteration": 0-3, "pr": null|N,
  "preview_url": null|url, "detail": "human-readable", "updated": "ISO-8601" }

Reusable bash step (define once per workflow):

  write_status() {  # $1=stage $2=phase $3=detail
    mkdir -p "workspaces/$SLUG/.adlc"
    cat > "workspaces/$SLUG/.adlc/status.json" << JSON
  { "stage": "$1", "phase": $2, "iteration": ${ITER:-0}, "pr": ${PR:-null},
    "preview_url": ${PREVIEW_URL:+\"$PREVIEW_URL\"}${PREVIEW_URL:-null},
    "detail": "$3", "updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
  JSON
    git add "workspaces/$SLUG/.adlc/status.json"
    git commit -m "chore($SLUG): status -> $1" && git push || true
  }

Where to call it:

adlc-generate.yml
  - after branch+scaffold:        write_status scaffolding 3 "Workspace created, installing dependencies"
  - before Claude Code starts:    write_status standards 4 "Loading coding standards"
  - in Claude Code prompt:        instruct it to write_status generating 5 / validating 6 as it progresses
  - after PR opened:              PR=$NUM write_status pr-open 7 "PR #$NUM opened, CI running"

adlc-ci.yml
  - on success (ADLC branches only):  write_status clean 8 "All checks green"
    (use ADLC_PAT for this push if you want it visible immediately; no retrigger needed)

adlc-iterate.yml
  - handled inside the Claude Code prompt + escalation step (already in adlc-iterate.yml)

adlc-preview.yml
  - after Pages deploy:
      PREVIEW_URL="https://saad-adlc.github.io/adlc-dev/previews/pr-$PR-$SLUG/"
      PR=$PR write_status preview-deployed 9 "Live preview deployed"

Notes:
- status.json commits land in workspaces/ so the CI path filter sees them; the
  "chore($SLUG): status" prefix can be excluded from CI triggers if re-runs are unwanted:
  paths-ignore or a commit-message guard.
- The chat side never guesses preview URLs — it reads preview_url from this file.
