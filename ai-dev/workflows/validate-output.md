# /validate-output

Run the validation checks for the current change before commit / PR.

## Steps
1. Verify all imports resolve.
2. Check no banned packages are present (per stack rules).
3. Check no hardcoded secrets (grep for known key patterns).
4. Run the stack's compile check:
   - Angular / React: `npx tsc --noEmit`
   - C# / .NET: `dotnet build`
   - Java: `mvn compile -q`
5. Apply the stack's validation checks (`ai-dev/validation/{stack}-validation.md`).
6. Report PASS or FAIL per check — stop on the first FAIL.

## Output format
For each check, output one of:
- `PASS: <check name>`
- `FAIL: <check name> — <reason>`

End with a single summary line: `OVERALL: PASS` or `OVERALL: FAIL`.
