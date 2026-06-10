---
name: adlc2-branch-management
description: "ADLC v2 Phase 3 — Workspace scaffolding (runs in GitHub Actions, not in chat). Consulted by adlc2-orchestrator to narrate status and verify the scaffold. Never triggered directly by user messages."
---

# Phase 3 — Branch & Scaffold (CI)

## What happens (adlc-generate.yml, on issue labelled adlc-generate)
1. Derives slug `issue-[N]-[kebab title]` and branch `feature/[slug]` from the issue
2. Creates the branch from main
3. Scaffolds `workspaces/[slug]/` — package.json (EXACT pinned versions, no ^),
   tsconfig, vite/eslint configs, index.html, src/main + App + test-setup
4. Runs `npm install` and commits package-lock.json (CI does this — never via MCP, file too large)
5. Commits spec.md (from the issue body) as the audit trail
6. Writes status.json: stage `scaffolding` → then `standards`

## status.json stage: `scaffolding`

## Narration
"Setting up the project workspace — creating the foundation files your app will be built on."

## Chat verification (if needed)
- `list_branches` → feature branch exists
- `get_file_contents` workspaces/[slug]/package-lock.json ref [branch] → install ran

## If stuck >5 min on this stage
The generate workflow likely failed before Claude Code started (label missing,
workflow error). Tell the user the build didn't start cleanly and flag for Saad.
