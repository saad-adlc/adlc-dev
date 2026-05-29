# /refactor-to-standards

Bring existing files into compliance with the relevant stack rules.

## Steps
1. Read the target file(s).
2. List every violation (numbered), citing the specific rule from `ai-dev/rules/{stack}/style.md` that is broken.
3. Ask for confirmation before applying fixes.
4. Fix one violation type at a time.
5. Run `/validate-output` after each batch.

## Boundaries
- Do not introduce changes outside the scope of declared violations.
- Do not refactor business logic unless the rule explicitly requires it.
