# Java / Spring Boot style rules

> Note: These rules are ADLC industry defaults pending Orix's Java standards doc.

## Approved stack
| Package | Version |
|---------|---------|
| Java | 21 LTS |
| Spring Boot | 3.2.x |
| Maven | 3.9.x |
| spring-security | 6.x |
| junit-jupiter | 5.x |
| mockito-core | 5.x |

## Banned — never use
- `System.out.println` → use SLF4J logger.
- Any dependency flagged with a known CVE.
- Any GPL-licensed package in production code.

## Java / Spring Boot standards
- Controller → Service → Repository layering — no exceptions.
- Controllers handle HTTP only — zero business logic.
- Constructor injection only — no `@Autowired` on fields.
- `@Valid` on all request bodies.
- `ResponseEntity<T>` return type on all controllers.
- Spring Data JPA repositories only — no raw SQL strings.

## File and structure
- Max file: 300 lines — split if longer.
- Max function: 40 lines — extract helpers if longer.
- No magic numbers — use named constants.
- No commented-out code in commits.
- Every public method needs Javadoc.

## Naming
- Class names: PascalCase.
- Method and variable names: camelCase.
- Constants: SCREAMING_SNAKE_CASE.
- Test class names end with `Test` (e.g. `UserServiceTest`).
