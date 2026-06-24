# WS8 (Orix `ai-dev/` standards) + WS9 (per-run budget) — Implementation Plan

**Date:** 2026-06-24 · **Branches:** `adlc-dev@feature/ws8-9-orix-standards` + an `adlc-standards` branch · **Status:** in progress
**Scope source:** PLAN.md §4 WS8/WS9 + the 2026-06-24 grills. Both land via PR (main is protected).

## Locked decisions (grills, 2026-06-24)

- **Package policy = ALLOW-LIST (default-deny).** Only approved packages permitted; `package.json` direct deps must be ⊆ the approved set. Banned names (`moment`, full `lodash`) = redundant 2nd layer. CVE/GPL = dynamic → Dependabot + license check (WS5), not a static list.
- **Controlled installs = on-demand + deterministic CI validator.** The agent MAY `npm install` *approved* packages when the spec needs them (the firewall already allows `registry.npmjs.org`). Enforcement is by **outcome**: a deterministic check validates the final `package.json`, independent of the agent — not regex-gating installs, not trusting the prompt.
- **Wiring = mount `ai-dev/` into the gh-aw prep** (`rules/react` + `rules/global`); the agent reads them (mirrors the hand-rolled path → both engines share one standard).
- **Full rule set captured in LAYERS** (Orix policy = "enforce in CI via linters/static-analysis"):
  | Layer | Rules |
  |---|---|
  | **Validator** (CI, deterministic) | package allow/banned + filename conventions (kebab-case, `.tsx`/`.test.tsx`) |
  | **ESLint in the scaffold** (no new deps) | `max-lines` 300, `max-lines-per-function` 40, `no-magic-numbers`, `@typescript-eslint/no-explicit-any`, functional-only (no-class) |
  | **Mounted prompt** | `ai-dev/rules/react/style.md` + `global/behavior.md` (the narrative + React Query/Zustand) |
  | **Reviewer** (`adlc-review`) | `as any` w/o comment, commented-out code, API loading/error/success, smallest-change, spec fidelity |
  | **Already enforced** | tsc / eslint / coverage (CI), secrets (deny hook) |
- **ESLint plugins** (`eslint-plugin-jsdoc`, a no-inline-styles rule, `eslint-plugin-unicorn` filename-case) = **fast-follow** (new *approved* devDeps), after the core lands. Until then JSDoc/inline-styles ride the reviewer.
- **WS9 = top-level `max-turns: 50`** (`engine.max-turns` is deprecated); keep daily 5000-AIC. Per-run AIC cap (`GH_AW_MAX_AI_CREDITS`) available — optional.

## Tasks

**WS9 (first; small)**
1. `adlc-generate.md`: top-level `max-turns: 50` → recompile lock. *(adlc-dev — this branch)*

**WS8 (validator TDD-first)**
2. `adlc-standards/steering/approved-packages.json` — the allow-list (runtime + dev) + banned names. Single source for agent + validator.
3. **Validator + tests (TDD)** in `adlc-standards/` — reads `package.json` direct deps; fails if any ∉ allow-list or ∈ banned; ignores transitive; + filename-convention check. RED → GREEN, like the deny hook.
4. Wire validator into **`adlc-ci`** (independent PR gate) + the workspace `npm run ci` (agent self-check). *(adlc-dev + the scaffold)*
5. Beef up the scaffold **`eslint.config.mjs`** with the no-new-dep Orix lint rules. *(adlc-dev `adlc-prep.sh`)*
6. **Mount `ai-dev/` + `approved-packages.json`** in `adlc-prep.sh`; update `adlc-generate.md` prompt (follow Orix rules; may install approved; never banned/unlisted) → recompile.
7. Extend **`adlc-review.md`** to the judgment rules → recompile.
8. Reconcile `steering/approved-stack.md` to defer to `approved-packages.json`.

## Acceptance

A generate run reads the Orix rules, installs an approved package when the spec needs it (e.g. `react-router-dom`), emits kebab-case files + passes the new lint rules, CI green; an **unlisted or banned** dep **fails `adlc-ci`**; the reviewer flags Orix-style violations; a run looping past **50 turns** is stopped.

## Open / fast-follow

- ESLint plugins (jsdoc / no-inline-styles / unicorn) as new approved devDeps.
- `ai-dev/rules/react/style.md` is "pending Orix's real React doc" — swap when Orix delivers (wiring stays).
- `@playwright/test`: approved but heavy (browser DLs); appears only if a spec needs e2e.
- Optional per-run AIC cap (`GH_AW_MAX_AI_CREDITS`) alongside `max-turns`.
- Controlled-install security recap: the agent's network/install power is **bounded by the deterministic `adlc-ci` validator** (a PR can't merge with an unapproved dep) + the deny hook + branch protection.
