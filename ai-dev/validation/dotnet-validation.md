# .NET validation guidance

## Grounded checks
- Keyword types like `string` and `int` are used where appropriate.
- `var` is used only when the type is obvious.
- General exception catches are avoided unless there is a documented reason.
- Disposable resources use `using` statements.
- Files that declare one namespace use file-scoped namespaces.
- `using` directives are outside the namespace declaration.
- Four-space indentation is used.

## Repo-specific checks to add
TODO: add the repository's actual restore, build, test, format, and analyzer commands.
