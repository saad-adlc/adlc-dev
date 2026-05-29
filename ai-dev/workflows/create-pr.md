# /create-pr <title>

Open a PR from `adlc-dev` to `adlc-stage` with the current changes.

## Steps
1. Commit all changes to a feature branch (never to main).
2. Branch format: `feature/<issue-id>-<short-description>`.
3. Write PR description containing:
   - Summary
   - Changes
   - Tests added
   - How to test
4. Push branch to `adlc-dev`.
5. Open PR targeting `adlc-stage/main`.
6. Add label: `adlc-generated`.
