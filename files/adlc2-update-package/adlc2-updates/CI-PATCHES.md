# ADLC CI patches — apply to saad-adlc/adlc-dev

Surgical old→new blocks against the current files (SHAs verified 2026-06-11):
- adlc-generate.yml @ 8c1235d
- adlc-iterate.yml  @ 0fa4db9
- adlc-ci.yml       @ a0eb90b
- adlc-preview.yml  @ 9bbd028
Plus one NEW file: adlc-signals.yml (in this package).

====================================================================
THE CANONICAL SLUG ALGORITHM (single source of truth)
====================================================================
kebab(title):
1. Lowercase ASCII letters (A–Z → a–z; other bytes unchanged by this step)
2. Replace every maximal run of characters outside [a-z0-9] with ONE hyphen
   (non-ASCII characters count as outside)
3. Trim leading and trailing hyphens
4. If longer than 40 chars: cut to 40, then strip the trailing partial word
   (delete back through the last hyphen), trim any trailing hyphen
5. If the result is empty, use "feature"

slug = "issue-" + N + "-" + kebab(title)

Reference bash (this exact text goes into adlc-generate.yml below):
  KEBAB=$(printf '%s' "$TITLE" | LC_ALL=C tr '[:upper:]' '[:lower:]' \
    | LC_ALL=C sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
  if [ "${#KEBAB}" -gt 40 ]; then
    KEBAB="${KEBAB:0:40}"; KEBAB=$(printf '%s' "$KEBAB" | sed -E 's/-[^-]*$//; s/-+$//')
  fi
  [ -z "$KEBAB" ] && KEBAB="feature"

Worked example: "Mortgage Sweet-Spot & Injection Calculator!" →
  old CI:  mortgage-sweet-spot--injection-calculat   (double hyphen, mid-word)
  new:     issue-N-mortgage-sweet-spot-injection     (clean, word boundary)

====================================================================
PATCH 1 — adlc-generate.yml
====================================================================

--- 1a. REPLACE the slug derivation inside "Create feature branch" ---

OLD:
          SLUG=$(echo "${{ github.event.issue.title }}" \
            | tr '[:upper:]' '[:lower:]' \
            | tr ' ' '-' \
            | tr -cd '[:alnum:]-' \
            | cut -c1-40)

NEW:
          TITLE="${{ github.event.issue.title }}"
          KEBAB=$(printf '%s' "$TITLE" \
            | LC_ALL=C tr '[:upper:]' '[:lower:]' \
            | LC_ALL=C sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
          if [ "${#KEBAB}" -gt 40 ]; then
            KEBAB="${KEBAB:0:40}"
            KEBAB=$(printf '%s' "$KEBAB" | sed -E 's/-[^-]*$//; s/-+$//')
          fi
          [ -z "$KEBAB" ] && KEBAB="feature"
          SLUG="$KEBAB"

(The lines below it that build BRANCH/WORKSPACE from $SLUG are unchanged.)

--- 1b. REPLACE the heredoc body inside "Create status helper" ---
(drops `phase`; helper now takes <stage> <detail>)

OLD (inside adlc-status.sh):
          # usage: SLUG=.. BRANCH=.. [PR=..] [PREVIEW_URL=..] ./adlc-status.sh <stage> <phase> <detail>
          set -e
          STAGE=$1; PHASE=$2; DETAIL=$3
          mkdir -p "workspaces/${SLUG}/.adlc"
          cat > "workspaces/${SLUG}/.adlc/status.json" << JSON
          { "stage": "${STAGE}", "phase": ${PHASE}, "iteration": ${ITER:-0},

NEW:
          # usage: SLUG=.. BRANCH=.. [PR=..] [PREVIEW_URL=..] ./adlc-status.sh <stage> <detail>
          set -e
          STAGE=$1; DETAIL=$2
          mkdir -p "workspaces/${SLUG}/.adlc"
          cat > "workspaces/${SLUG}/.adlc/status.json" << JSON
          { "stage": "${STAGE}", "iteration": ${ITER:-0},

--- 1c. UPDATE the two helper call sites (phase arg removed) ---

OLD:  ./adlc-status.sh scaffolding 3 "Workspace created, dependencies installed"
NEW:  ./adlc-status.sh scaffolding "Workspace created, dependencies installed"

OLD:  run: ./adlc-status.sh generating 5 "Writing tests and implementation, then validating"
NEW:  run: ./adlc-status.sh generating "Writing tests and implementation, then validating"

--- 1d. REPLACE the json heredoc inside "Status -> pr-open" ---

OLD:
          { "stage": "pr-open", "phase": 7, "iteration": 0, "pr": ${PR},

NEW:
          { "stage": "pr-open", "iteration": 0, "pr": ${PR},

====================================================================
PATCH 2 — adlc-iterate.yml
====================================================================

--- 2a. REPLACE the json heredoc inside "Escalate — cap reached" ---

OLD:
          { "stage": "escalated", "phase": 8, "iteration": 3,

NEW:
          { "stage": "escalated", "iteration": 3,

--- 2b. REPLACE the json heredoc inside "Write status -> iterating" ---

OLD:
          { "stage": "iterating", "phase": 8,

NEW:
          { "stage": "iterating",

--- 2c. REPLACE rules 6–7 in the Claude Code prompt
        (detail contract + spec change log) ---

OLD:
          6. Update the "detail" field in %s/.adlc/status.json with a one-line
             plain-English summary of what you fixed (keep stage "iterating")
          7. Do NOT commit — the workflow handles git

NEW:
          6. Update the "detail" field in %s/.adlc/status.json with a one-line
             summary of what you fixed, in plain business language — NO file
             paths, NO error codes, NO tool names (keep stage "iterating")
          7. Append a dated entry to "## Change log" in %s/spec.md (create the
             section if missing): "- [YYYY-MM-DD] iteration-N: [what changed,
             in plain language, and what triggered it]"
          8. Do NOT commit — the workflow handles git

  ALSO update the printf argument list on the line after the prompt: it
  currently passes "$WORKSPACE" for each %s — the new prompt has ONE more %s
  (rule 7), so add one more "$WORKSPACE" to the argument list:
OLD:  "$WORKSPACE" "$WORKSPACE" \
NEW:  "$WORKSPACE" "$WORKSPACE" "$WORKSPACE" \

====================================================================
PATCH 3 — adlc-ci.yml
====================================================================

--- 3a. REPLACE the json heredoc inside "Write clean status"
        (drops phase; preserves the real iteration count) ---

OLD:
          SLUG="${BRANCH#feature/}"
          mkdir -p "workspaces/${SLUG}/.adlc"
          cat > "workspaces/${SLUG}/.adlc/status.json" << JSON
          { "stage": "clean", "phase": 8, "iteration": 0,

NEW:
          SLUG="${BRANCH#feature/}"
          mkdir -p "workspaces/${SLUG}/.adlc"
          ITER=$(jq -r '.iteration // 0' "workspaces/${SLUG}/.adlc/status.json" 2>/dev/null || echo 0)
          cat > "workspaces/${SLUG}/.adlc/status.json" << JSON
          { "stage": "clean", "iteration": ${ITER},

====================================================================
PATCH 4 — adlc-preview.yml
====================================================================
Adds deploying + deploy-failed via the GitHub contents API (no branch
checkout gymnastics, works regardless of what the working tree holds),
and drops `phase` from the final write.

--- 4a. INSERT a new step directly AFTER "Detect workspace from changed files" ---

      - name: Status -> deploying (via API — working tree untouched)
        if: steps.detect.outputs.workspace != ''
        env:
          GH_TOKEN: ${{ secrets.ADLC_AGENT_TOKEN }}
        run: |
          BRANCH="${{ github.event.workflow_run.pull_requests[0].head.ref }}"
          SLUG="${BRANCH#feature/}"
          FILE="workspaces/${SLUG}/.adlc/status.json"
          CUR=$(gh api "/repos/${{ github.repository }}/contents/${FILE}?ref=${BRANCH}" 2>/dev/null || echo '{}')
          SHA=$(echo "$CUR" | jq -r '.sha // empty')
          ITER=$(echo "$CUR" | jq -r '.content // ""' | base64 -d 2>/dev/null | jq -r '.iteration // 0' || echo 0)
          BODY=$(jq -n --arg s deploying --argjson i "$ITER" \
            --argjson pr "${{ steps.detect.outputs.pr_number }}" \
            '{stage:$s, iteration:$i, pr:$pr, preview_url:null,
              detail:"Publishing the live preview", updated:(now|todate)}')
          gh api --method PUT "/repos/${{ github.repository }}/contents/${FILE}" \
            -f message="chore(${SLUG}): status -> deploying [skip ci]" \
            -f branch="$BRANCH" \
            -f content="$(printf '%s' "$BODY" | base64 -w0)" \
            $( [ -n "$SHA" ] && printf -- '-f sha=%s' "$SHA" )

--- 4b. INSERT a failure handler as the LAST step of the job ---

      - name: Status -> deploy-failed
        if: failure() && steps.detect.outputs.workspace != ''
        env:
          GH_TOKEN: ${{ secrets.ADLC_AGENT_TOKEN }}
        run: |
          BRANCH="${{ github.event.workflow_run.pull_requests[0].head.ref }}"
          SLUG="${BRANCH#feature/}"
          FILE="workspaces/${SLUG}/.adlc/status.json"
          CUR=$(gh api "/repos/${{ github.repository }}/contents/${FILE}?ref=${BRANCH}" 2>/dev/null || echo '{}')
          SHA=$(echo "$CUR" | jq -r '.sha // empty')
          ITER=$(echo "$CUR" | jq -r '.content // ""' | base64 -d 2>/dev/null | jq -r '.iteration // 0' || echo 0)
          BODY=$(jq -n --arg s deploy-failed --argjson i "$ITER" \
            --argjson pr "${{ steps.detect.outputs.pr_number }}" \
            '{stage:$s, iteration:$i, pr:$pr, preview_url:null,
              detail:"The app is built and safe, but publishing the preview failed — needs a manual look", updated:(now|todate)}')
          gh api --method PUT "/repos/${{ github.repository }}/contents/${FILE}" \
            -f message="chore(${SLUG}): status -> deploy-failed [skip ci]" \
            -f branch="$BRANCH" \
            -f content="$(printf '%s' "$BODY" | base64 -w0)" \
            $( [ -n "$SHA" ] && printf -- '-f sha=%s' "$SHA" )

--- 4c. In "Status -> preview-deployed": REPLACE the json heredoc line ---

OLD:
          { "stage": "preview-deployed", "phase": 9, "iteration": 0, "pr": ${PR},

NEW:
          { "stage": "preview-deployed", "iteration": $(jq -r '.iteration // 0' "workspaces/${SLUG}/.adlc/status.json" 2>/dev/null || echo 0), "pr": ${PR},

====================================================================
PATCH 5 — NEW FILE: .github/workflows/adlc-signals.yml
====================================================================
Full file ships in this package (adlc-signals.yml). Handles:
- `/adlc-approved:` PR comment → adds the adlc-approved label (creating it
  if missing) + confirmation comment → engineering's merge signal
- `Rolled back for spec revision:` PR comment → closes the PR automatically
Both guarded to feature/issue-* PRs. Neither triggers adlc-iterate (its
guard only matches `/adlc-iterate:`), verified against 0fa4db9.

====================================================================
NOT DOING (validated against the real repo)
====================================================================
- Vite `base` line in the scaffold — unnecessary; adlc-preview.yml passes
  --base at build time. Scaffold untouched.
- New adlc-deploy.yml — unnecessary; adlc-preview.yml IS Phase 9 and is
  patched instead.
- `standards` / `validating` stage writes — generation runs phases 4–6
  inside the `generating` stage with the agent forbidden from touching
  status.json mid-run. The skills are corrected to match reality instead
  of forcing CI writes that can't happen mid-agent.
