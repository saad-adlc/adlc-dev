---
name: ADLC Iterate
on:
  pull_request:
    types: [labeled]
    names: [adlc-iterate]
  pull_request_review:
    types: [submitted]
  issue_comment:
    types: [created]
  workflow_run:
    workflows: ["ADLC — CI"]
    types: [completed]

# Compound guard (faithful to the hand-rolled adlc-iterate.yml): only the four
# intended events on an ADLC feature branch / a /adlc-iterate: comment proceed —
# AND only when gh-aw is the active engine (ADLC_ENGINE != legacy).
if: >
  vars.ADLC_ENGINE != 'legacy' && (
  (github.event_name == 'workflow_run' &&
   github.event.workflow_run.conclusion == 'failure' &&
   startsWith(github.event.workflow_run.head_branch, 'feature/issue-')) ||
  (github.event_name == 'pull_request_review' &&
   github.event.review.state == 'changes_requested' &&
   startsWith(github.event.pull_request.head.ref, 'feature/issue-')) ||
  (github.event_name == 'pull_request' &&
   github.event.label.name == 'adlc-iterate' &&
   startsWith(github.event.pull_request.head.ref, 'feature/issue-')) ||
  (github.event_name == 'issue_comment' &&
   github.event.issue.pull_request &&
   startsWith(github.event.comment.body, '/adlc-iterate:')) )

permissions:
  contents: write     # cap/status steps push to the PR branch; push-to-pr-branch appends the fix
  pull-requests: read
  issues: read

concurrency:
  group: adlc-iterate      # static, matches the hand-rolled: serialize ALL iterations.
                           # (A per-PR key would collapse to empty on workflow_run events,
                           # which carry no pull_request/issue number.)
  cancel-in-progress: false

engine:
  id: claude
  model: claude-sonnet-4-6
  env:
    ANTHROPIC_BASE_URL: https://orix-adastra-adlc.services.ai.azure.com/anthropic

network:
  allowed: [defaults, orix-adastra-adlc.services.ai.azure.com]

tools:
  edit:
  bash:
    - "npm:*"
    - "npx:*"
    - "node:*"
    - "git:*"
    - "ls:*"
    - "cat:*"
    - "mkdir:*"
    - "mv:*"
    - "cp:*"
    - "sed:*"
    - "grep:*"

steps:
  - name: Resolve PR + branch
    id: ctx
    uses: actions/github-script@v7
    with:
      github-token: "${{ secrets.ADLC_AGENT_TOKEN }}"
      script: |
        let branch, pr;
        if (context.eventName === 'workflow_run') {
          branch = context.payload.workflow_run.head_branch;
          const prs = await github.rest.pulls.list({ ...context.repo, head: `${context.repo.owner}:${branch}`, state: 'open' });
          pr = prs.data[0]?.number;
        } else if (context.eventName === 'issue_comment') {
          pr = context.payload.issue.number;
          const d = await github.rest.pulls.get({ ...context.repo, pull_number: pr });
          branch = d.data.head.ref;
        } else { branch = context.payload.pull_request.head.ref; pr = context.payload.pull_request.number; }
        core.setOutput('branch', branch); core.setOutput('pr', String(pr));
  - name: Checkout PR head
    uses: actions/checkout@v6
    with: { ref: "${{ steps.ctx.outputs.branch }}", token: "${{ secrets.ADLC_AGENT_TOKEN }}", fetch-depth: 0 }
  - name: Setup Node 20
    uses: actions/setup-node@v4
    with: { node-version: '20' }
  - name: Enforce iteration cap (3), mount hooks, status -> iterating
    env:
      STANDARDS_REPO: saad-adlc/adlc-standards
      STANDARDS_TOKEN: "${{ secrets.ADLC_AGENT_TOKEN }}"
      GH_TOKEN: "${{ secrets.ADLC_AGENT_TOKEN }}"
      PR: "${{ steps.ctx.outputs.pr }}"
      BRANCH: "${{ steps.ctx.outputs.branch }}"
    run: |
      set -uo pipefail
      git fetch origin main
      N=$(git log origin/main..HEAD --oneline | grep -c 'iteration-' || true)
      WS=$(git diff --name-only origin/main..HEAD | grep -oE '^workspaces/[^/]+' | sort -u | head -1)
      echo "ADLC_WORKSPACE=${WS}" >> "$GITHUB_ENV"
      if [ "$N" -ge 3 ]; then
        echo "ADLC_CAPPED=true" >> "$GITHUB_ENV"
        mkdir -p "$WS/.adlc"
        cat > "$WS/.adlc/status.json" <<JSON
      { "stage": "escalated", "iteration": 3, "pr": ${PR}, "preview_url": null,
        "detail": "Automatic fixing stopped after 3 attempts — human input needed",
        "updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
      JSON
        git config user.name adlc-agent; git config user.email adlc-agent@saad-adlc.com
        git add "$WS/.adlc/status.json"; git commit -m "chore: status -> escalated [skip ci]"
        git push "https://x-access-token:${GH_TOKEN}@github.com/${{ github.repository }}.git" "$BRANCH"
      else
        echo "ADLC_CAPPED=false" >> "$GITHUB_ENV"
        echo "ADLC_NEXT=$((N + 1))" >> "$GITHUB_ENV"
        git clone --depth 1 "https://x-access-token:${STANDARDS_TOKEN}@github.com/${STANDARDS_REPO}.git" .adlc-standards
        mkdir -p .claude/hooks
        cp .adlc-standards/hooks/pretooluse-deny.sh .claude/hooks/pretooluse-deny.sh
        chmod +x .claude/hooks/pretooluse-deny.sh
        cp .adlc-standards/hooks/settings.template.json .claude/settings.json
        cp .adlc-standards/constitution.md ./constitution.md
        printf '%s\n' '.adlc-standards/' '.claude/' 'constitution.md' >> .git/info/exclude
        mkdir -p "$WS/.adlc"
        cat > "$WS/.adlc/status.json" <<JSON
      { "stage": "iterating", "iteration": $((N+1)), "pr": ${PR}, "preview_url": null,
        "detail": "Fixing — attempt $((N+1)) of 3",
        "updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
      JSON
        git config user.name adlc-agent; git config user.email adlc-agent@saad-adlc.com
        git add "$WS/.adlc/status.json"; git commit -m "chore: status -> iterating [skip ci]"
        git push "https://x-access-token:${GH_TOKEN}@github.com/${{ github.repository }}.git" "$BRANCH"
      fi

safe-outputs:
  push-to-pull-request-branch:
    target: triggering
    required-labels: [adlc-generated]
    if-no-changes: warn
    max: 1
    protected-files:
      policy: fallback-to-issue
      exclude: ["package.json", "package-lock.json"]
  add-comment:
    max: 1
---

# ADLC Iterate (self-healing, max 3)

If `$ADLC_CAPPED` is `true`: STOP. Emit ONE add-comment that the 3-iteration cap is
reached and a human must intervene. Make NO code changes.

Otherwise (attempt `$ADLC_NEXT` of 3):
- Work ONLY inside `$ADLC_WORKSPACE` (deny hook + Protected Files enforce this). Do NOT
  run `npm install`, push, or merge. Do NOT edit `.adlc/status.json`.
- Read `constitution.md`. Determine the failure: a failing **ADLC — CI** run, a
  changes-requested review, or a `/adlc-iterate:` comment (apply that change exactly + minimally).
- Make the MINIMAL fix — no refactors, no new deps, no deleted/weakened tests.
- `cd $ADLC_WORKSPACE && npm run ci` until green.
- Append a dated line to `$ADLC_WORKSPACE/spec.md` `## Change log` (plain language).
- Commit ONLY your workspace: `git add "$ADLC_WORKSPACE" && git commit -m "fix($ADLC_SLUG): iteration-$ADLC_NEXT"`.

## Output
- **push-to-pull-request-branch** (your fix commit; CI re-runs).
- **add-comment**: "attempt N/3 pushed" in plain language.
