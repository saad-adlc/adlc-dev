# C# / .NET style rules (grounded)

These rules are based on Microsoft Learn .NET coding conventions.

## General language use
- Use C# language keywords like `string`, `int`, and `bool` instead of runtime type names where applicable.
- Use modern C# language features when appropriate.
- Use `async` / `await` for I/O-bound operations.
- Catch only exceptions that can be properly handled; avoid catching general exceptions.
- Use specific exception types.

## Typing
- Use `var` only when the type is obvious from the right-hand side of the assignment.
- Do not use `var` as a replacement for `dynamic`.
- Prefer explicit typing when the type is not obvious.

## Resource management
- Use `using` statements for disposable resources.
- Prefer the newer `using` syntax that does not require braces when appropriate.

## File and namespace conventions
- Use file-scoped namespace declarations when a file declares a single namespace.
- Place `using` directives outside the namespace declaration.

## Formatting
- Use four spaces for indentation.
