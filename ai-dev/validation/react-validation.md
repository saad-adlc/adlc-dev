# React / TypeScript validation guidance

## Checks
- `npx tsc --noEmit` passes with zero errors.
- `npx eslint . --max-warnings 0` passes.
- No banned packages in `package.json` (`moment`, `lodash` full bundle).
- No hardcoded secrets (grep for known key patterns).
- All API calls handle loading / error / success states.
- Functional components only — no class components.
- No `as any` casts without an explanatory comment.
- Unit test coverage ≥ 80% (lines).

## Repo-specific checks to add
TODO: add the repository's actual build, test, lint, and format commands.
