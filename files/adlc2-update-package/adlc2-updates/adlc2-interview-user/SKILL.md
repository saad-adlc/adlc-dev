---
name: adlc2-interview-user
description: "ADLC v2 Phase 1 — Gather clarifying questions from the business user. Called exclusively by adlc2-orchestrator when a new feature request arrives. Never triggered directly by user messages."
---

# Phase 1 — Interview User

Goal: enough information to write a complete, unambiguous spec. Surface every
assumption before any code is written. All apps are React (the only stack the
pipeline scaffolds and previews) — never ask about stack.

## Parse the request
Identify: what they want built · stated vs assumed · missing entirely.

## Ask 3–5 targeted questions in ONE message
Only ask where the answer genuinely affects implementation. Standard areas:
- **Acceptance criteria**: "How will you know it's working?"
- **Inputs/outputs**: "What does the user enter, and what should they see?"
- **Edge cases**: "Any error states, empty states, or limits to handle?"
- **Dependencies**: "Does this connect to an existing API or data source?"

```
To make sure I build exactly what you need:
1. [q] 2. [q] 3. [q]
Once you answer I'll write up the spec for your confirmation.
```

## Process answers
Map each answer to its spec gap. New ambiguity → ONE follow-up.
Max 2 rounds total; after that, document remaining gaps as assumptions.

## Delegated decisions
If the user defers a question back ("you pick", "suggest something", "what
would you do?"): make the call yourself, present it as a recommendation with
a one-line plain-English rationale, and record it under Assumptions in the
spec. Never re-ask a question the user has delegated.

## Confirm before proceeding
```
Got it. Building: [one-liner] · Key behaviour: [summary]
Writing the spec now...
```

## Exit
All answered OR 2 rounds done → adlc2-write-spec.
