# /generate-feature <description>

Generate a new feature end-to-end from a written description.

## Steps
1. Ask 3–5 clarifying questions before writing any code.
2. Write `spec.md` with: requirements, acceptance criteria, files to touch.
3. Wait for human confirmation on the spec.
4. Generate code per the relevant stack rules in `ai-dev/rules/{stack}/style.md`.
5. Write unit tests alongside implementation.
6. Run `/validate-output` before committing.

## Routing
Select the stack rules based on the target file types:
- Angular files → `ai-dev/rules/angular/style.md` + `ai-dev/validation/angular-validation.md`
- React files → `ai-dev/rules/react/style.md` + `ai-dev/validation/react-validation.md`
- C# / .NET files → `ai-dev/rules/dotnet/style.md` + `ai-dev/validation/dotnet-validation.md`
- Java files → `ai-dev/rules/java/style.md` + `ai-dev/validation/java-validation.md`
