# React / TypeScript style rules

> Note: These rules are ADLC industry defaults pending Orix's React standards doc.

## Approved stack
| Package | Version |
|---------|---------|
| react | ^18.x |
| typescript | ^5.x (strict mode) |
| vite | ^5.x |
| react-router-dom | ^6.x |
| axios | ^1.x |
| zustand | ^4.x |
| @tanstack/react-query | ^5.x |
| vitest | ^1.x |
| @playwright/test | ^1.x |

## Banned — never use
- `moment` → use `date-fns`
- `lodash` full bundle → use `lodash-es` with tree-shaking
- Any package flagged with a known CVE
- Any GPL-licensed package in production code

## TypeScript / React standards
- Functional components only — no class components.
- All props typed with an interface — no `any`.
- No `as any` casts without an explanatory comment.
- CSS Modules or Tailwind only — no inline styles.
- All API calls handle: loading / error / success states.
- React Query for server state, Zustand for client state.

## File and structure
- Max file: 300 lines — split if longer.
- Max function: 40 lines — extract helpers if longer.
- No magic numbers — use named constants.
- No commented-out code in commits.
- Every public function needs JSDoc.

## Naming
- File names use kebab-case (e.g. `user-profile.tsx`).
- Component files use `.tsx`; non-component TypeScript uses `.ts`.
- Unit test files end with `.test.ts` or `.test.tsx`.
