# /iterate <pr-number> <feedback>

Apply PR review feedback as a new commit on the existing feature branch.

## Bot-comment filter (MUST run first)

Before doing anything else, check whether the feedback is bot-generated noise.
Treat the feedback as **bot noise** (do nothing, post nothing) if it matches ANY of these patterns:

- Starts with or contains `🤔 **ADLC —`
- Starts with or contains `🔍 **ADLC Preview deployed`
- Starts with `ADLC-BOT:`
- Contains `<!-- adlc-bot -->` or `<!-- adlc-no-iterate -->`
- The entire feedback body is composed only of recursive copies of these patterns

If bot noise is detected:
1. Output to the user: "No actionable human feedback found on PR #<n>. The feedback appears to be bot-generated automation messages — skipping iteration."
2. **Stop. Do not post any GitHub comment. Do not make any code changes.**

## Steps (only run when genuine human feedback is present)

1. Fetch PR comments and inline review comments.
2. Filter out any comment authored by an ADLC bot account (`saad-vts`, `github-actions[bot]`, or any comment body matching the bot-noise patterns above).
3. Map each remaining human comment to the original spec.
4. Create new branch (if working off a clean checkout): `feature/<id>-iteration-<n>`. If already on the feature branch, continue there.
5. Apply changes to address each comment.
6. Run `/validate-output`.
7. Push and update the PR with a comment summarising what changed, prefixed with `<!-- adlc-bot -->` on the first line.

## Boundaries
- Do not change anything outside the scope of the review comments.
- If a human comment is ambiguous after reading context, ask the user for clarification — do not guess, and do NOT post a GitHub comment asking for clarification (that triggers the loop).
- Never iterate in response to your own clarification-request comments.
