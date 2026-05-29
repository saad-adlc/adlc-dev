# /iterate <pr-number> <feedback>

Apply PR review feedback as a new commit on the existing feature branch.

## Steps
1. Fetch PR comments and inline review comments.
2. Map each comment to the original spec.
3. Create new branch (if working off a clean checkout): `feature/<id>-iteration-<n>`. If already on the feature branch, continue there.
4. Apply changes to address each comment.
5. Run `/validate-output`.
6. Push and update the PR with a comment summarising what changed.

## Boundaries
- Do not change anything outside the scope of the review comments.
- If a comment is ambiguous, ask for clarification — do not guess.
