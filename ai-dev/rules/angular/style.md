# Angular style rules (grounded)

These rules are based on the official Angular style guide.

## Naming and files
- Separate words in file names with hyphens.
- End unit test files with `.spec.ts`.
- Match file names to the TypeScript identifier within the file.
- Use the same base file name for a component's TypeScript, template, and styles.
- Avoid overly generic file names such as `helpers.ts`, `utils.ts`, or `common.ts`.

## Project structure
- Keep Angular UI code inside `src`.
- Bootstrap the application from `src/main.ts`.
- Group closely related files in the same directory.
- Organize by feature areas instead of folders like `components`, `directives`, and `services` when structuring app code.
- Prefer one Angular concept per file.

## Dependency injection
- Prefer `inject()` over constructor parameter injection.

## Components and templates
- Keep components and directives focused on presentation.
- Avoid overly complex logic in templates.
- Use `protected` for class members that are only used by the template.
- Use `readonly` for properties that should not change.
- Prefer `class` and `style` bindings over `ngClass` and `ngStyle`.
- Name event handlers for what they do, not for the triggering event.
- Keep lifecycle methods simple.
- Implement lifecycle hook interfaces when using lifecycle hooks.
