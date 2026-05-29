# Research validation notes

This package was assembled using grounded sources where available.

## Official / primary-source findings used

### Claude Code
Anthropic's `CLAUDE.md` guidance: project-specific context that can live at the repo root and other scopes. Useful for documenting project structure, coding standards, commands, testing instructions, and workflow notes. Keep concise and human-readable.
Source:
- https://claude.com/blog/using-claude-md-files

### Angular
The Angular style guide explicitly recommends:
- hyphen-separated file names
- `.spec.ts` for tests
- matching names across TS / template / styles
- putting UI code under `src`
- using `main.ts` for bootstrap
- grouping closely related files together
- organizing by feature areas rather than code-type folders
- preferring `inject()` over constructor parameter injection
- keeping components / directives focused on presentation
- avoiding overly complex logic in templates
- using `protected` for members only used by the template
- using `readonly` for properties that should not change
- preferring `class` and `style` bindings over `ngClass` and `ngStyle`
- keeping lifecycle methods simple and implementing lifecycle interfaces

Source:
- https://angular.dev/style-guide

### C# / .NET
Microsoft Learn explicitly recommends:
- using language keywords like `string` and `int` instead of runtime names
- using `var` only when the type is obvious from the right-hand side
- avoiding `var` as a replacement for `dynamic`
- catching specific exceptions instead of general exceptions
- using `async` / `await` for I/O-bound operations
- using `using` statements and the newer `using` syntax for disposable resources
- using file-scoped namespace declarations for files that declare a single namespace
- placing `using` directives outside the namespace declaration
- using four spaces for indentation

Source:
- https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions

### Markdown linting
The official `@eslint/markdown` plugin provides `markdown/recommended` and documents rules such as `fenced-code-language`, `heading-increment`, and `no-multiple-h1`.
Sources:
- https://www.npmjs.com/package/@eslint/markdown
- https://eslint.org/blog/2024/10/eslint-json-markdown-support/

## ADLC variant additions (NOT grounded in a single Orix source)

### React / TypeScript
The React rules under `ai-dev/rules/react/style.md` are ADLC industry defaults pending Orix's authoritative React standards doc. They cover:
- TypeScript strict mode
- Functional components and hooks
- React Query for server state, Zustand for client state
- CSS Modules / Tailwind only — no inline styles

### Java / Spring Boot
The Java rules under `ai-dev/rules/java/style.md` are ADLC industry defaults pending Orix's authoritative Java standards doc. They cover:
- Controller → Service → Repository layering
- Constructor injection only
- Spring Data JPA repositories only — no raw SQL

When Orix provides their React or Java standards docs, replace these rule files and update this section.

## Internal ORIX grounding used
- ORIX material states that GitHub Copilot and Claude Code are the target AI developer toolchain standard.
- ORIX CoreApps policy states coding standards should be centrally maintained and enforced in CI using linters / formatters / static analysis and required checks.

## What was intentionally NOT fabricated
- No repo-specific build, test, or lint commands were invented.
- No repo-specific folder names beyond sourced examples were invented.
- No project-specific Angular or .NET architecture was claimed unless it already appeared in the source package design.
