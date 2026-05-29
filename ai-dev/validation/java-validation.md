# Java / Spring Boot validation guidance

## Checks
- `mvn compile -q` succeeds with zero warnings.
- `mvn test -q` succeeds.
- No `System.out.println` in source — SLF4J logger only.
- No hardcoded secrets.
- No field-level `@Autowired` — constructor injection only.
- No raw SQL strings — Spring Data JPA repositories only.
- Controllers contain no business logic.
- Unit test coverage ≥ 80% (lines).

## Repo-specific checks to add
TODO: add the repository's actual build, test, lint, and format commands.
