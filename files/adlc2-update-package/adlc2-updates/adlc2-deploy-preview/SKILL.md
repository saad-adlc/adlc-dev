---
name: adlc2-deploy-preview
description: "ADLC v2 Phase 9 — GitHub Pages preview deploy in CI (adlc-preview.yml). Consulted by adlc2-orchestrator to narrate status, explain the preview URL, and handle deploy failures. Never triggered directly by user messages."
---

# Phase 9 — Deploy Preview (CI: adlc-preview.yml)

## What happens
Triggered when "ADLC — CI" succeeds on a PR (i.e. the branch reached `clean` —
first build or any iteration).
1. Writes status.json: stage `deploying` (via the GitHub contents API)
2. Builds the workspace with the base path injected AT BUILD TIME:
   `npx vite build --base /adlc-dev/previews/pr-[N]-[slug]/`
   (no scaffold-level base config exists or is needed)
3. Publishes `dist/` to the `gh-pages` branch under `previews/pr-[N]-[slug]/`
4. Writes status.json: stage `preview-deployed` + preview_url, and posts the
   URL as a PR comment
On any step failing: stage `deploy-failed`, plain-language detail.

## URL pattern
`https://saad-adlc.github.io/adlc-dev/previews/pr-[N]-[slug]/`
([N] = PR number.) The URL is stable across iterations of the same PR — after
a Phase 10 change the user refreshes the SAME link. The orchestrator never
constructs this URL by hand; it always reads `preview_url` from status.json.

## Narration
clean → deploying hand-off: "Checks passed — publishing your live preview now, almost there."
deploying: "Publishing your live preview — this is the last step."
preview-deployed: orchestrator renders the link card (see orchestrator Phase 9).

## Failure handling (stage: deploy-failed)
The app itself is built, tested, and safe — only the preview publish failed.
Tell the user exactly that, flag for Saad, set blocked-on. Do NOT route this
to auto-iterate (it is not a code problem) and do NOT call it an escalation
of the build. Once Saad fixes the publish, the next CI pass re-triggers the
deploy and the loop resumes normally.

## Chat verification (if needed)
`get_file_contents` status.json ref [branch] → preview_url populated.
