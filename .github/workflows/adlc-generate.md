---
name: ADLC Generate
on:
  issues:
    types: [labeled]
    names: [adlc-generate]

# Engine coexistence: skip entirely when the operator has forced the hand-rolled
# engine (ADLC_ENGINE=legacy). Default/unset/'gh-aw' -> this runs; hand-rolled skips.
if: "${{ vars.ADLC_ENGINE != 'legacy' }}"

permissions:
  contents: read      # Fallback B: no early push from the agent job; the safe-output job owns the PR write
  issues: read

engine:
  id: claude
  model: claude-sonnet-4-6
  env:
    ANTHROPIC_BASE_URL: https://orix-adastra-adlc.services.ai.azure.com/anthropic

network:
  allowed: [defaults, orix-adastra-adlc.services.ai.azure.com]

tools:
  edit:
  # gh-aw passes each pattern verbatim into Claude's --allowed-tools as Bash(<pattern>);
  # "npm:*" -> Bash(npm:*). Colon syntax is native Claude allowed-tools (verified v0.79.8).
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
  - name: Checkout adlc-dev
    uses: actions/checkout@v6
    with: { token: "${{ secrets.ADLC_AGENT_TOKEN }}", fetch-depth: 0 }
  - name: Setup Node 20
    uses: actions/setup-node@v4
    with: { node-version: '20' }
  - name: Deterministic prep (slug, branch, scaffold, mount; Fallback B)
    env:
      ISSUE_NUMBER: "${{ github.event.issue.number }}"
      ISSUE_TITLE: "${{ github.event.issue.title }}"
      STANDARDS_REPO: saad-adlc/adlc-standards
      STANDARDS_TOKEN: "${{ secrets.ADLC_AGENT_TOKEN }}"
    run: bash .github/scripts/adlc-prep.sh
  - name: Record run context for the fail-over controller (run -> issue mapping)
    run: |
      printf '{ "issue": %s }\n' "${{ github.event.issue.number }}" > "${{ runner.temp }}/adlc-context.json"
  - name: Upload run context artifact
    uses: actions/upload-artifact@v4
    with: { name: adlc-context, path: "${{ runner.temp }}/adlc-context.json", retention-days: 7 }

safe-outputs:
  create-pull-request:
    title-prefix: "feat: "
    labels: [adlc-generated]
    base-branch: main
    allowed-branches: ["feature/*"]
    preserve-branch-name: true
    draft: false
    if-no-changes: warn
    max: 1
    protected-files:
      policy: blocked        # HARD-block any patch touching protected paths (not request_review,
                             # which would still open the PR). Deny hook is defense-in-depth on top.
      exclude: ["package.json", "package-lock.json"]
  add-comment:
    max: 1
---

# ADLC Generate (Spec-Kit templated, TDD)

You implement a GitHub issue as a React+TypeScript+Vite+Vitest app. The workspace
`$ADLC_WORKSPACE` is already scaffolded (deps installed) on branch `$ADLC_BRANCH`.

## Hard rules (enforced by `.claude/hooks/pretooluse-deny.sh`, Protected Files, firewall)
- Work ONLY inside `$ADLC_WORKSPACE`. Never touch `.github/`, root config, other
  workspaces, `.claude/`, `constitution.md`, `steering/`, `.speckit/`, `.adlc-standards/`.
- Do NOT run `npm install`. Do NOT push or merge. Do NOT edit `.adlc/status.json`.

## Steps
1. Read `constitution.md`, `steering/approved-stack.md`, `steering/compliance-rules.md`.
2. Read the issue (title + body) — it is the intent.
3. Fill the mounted Spec-Kit templates into `$ADLC_WORKSPACE/` (adapt/omit fields that
   don't fit a small MVP feature; keep each artifact honest, no placeholders):
   - `.speckit/spec-template.md`  → `$ADLC_WORKSPACE/spec.md`
   - `.speckit/plan-template.md`  → `$ADLC_WORKSPACE/plan.md`
   - `.speckit/tasks-template.md` → `$ADLC_WORKSPACE/tasks.md`
4. Implement TDD in `$ADLC_WORKSPACE/src/` — tests first (`*.test.tsx`,
   `toBeInTheDocument()` not `toBeDefined()`), then minimal components; mount in `src/App.tsx`.
5. Analyze-style self-check: every acceptance criterion in `spec.md` maps to a task in
   `tasks.md` and a test; approved stack only; no banned packages; no TODOs.
6. `cd $ADLC_WORKSPACE && npm run ci` — fix until green.
7. Commit your workspace — this single `git add` stages the prep-written scaffold + your
   `spec/plan/tasks` + `src` into ONE commit, which is exactly what reaches the PR:
   `git add "$ADLC_WORKSPACE" && git commit -m "feat($ADLC_SLUG): implement issue #${{ github.event.issue.number }}"`.

## Output
- **create-pull-request**: title = the feature in plain words, body = summary +
  `Closes #${{ github.event.issue.number }}` + changes/tests tables + link to `spec.md`.
- **add-comment** on the issue: plain-language "what was built" (no paths/error codes).
