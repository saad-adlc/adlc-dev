# Spec: Salary to Hourly Calculator

**Issue:** #TBD
**Stack:** React
**Branch:** `feature/issue-tbd-salary-to-hourly`
**Workspace:** `workspaces/issue-tbd-salary-to-hourly/`
**Date:** 2026-06-04

## What we're building
A tiny standalone React component that converts an annual salary into hourly, daily, weekly, and monthly rates. The user enters their salary and optionally adjusts hours per week and weeks per year. Results update live as they type.

## Acceptance criteria
1. [ ] Three inputs: Annual Salary, Hours/Week (default 40), Weeks/Year (default 52)
2. [ ] Four outputs update live: Hourly, Daily, Weekly, Monthly
3. [ ] Component renders standalone with no external dependencies beyond React

## Files to create
| Path | Purpose |
|------|---------|
| `src/SalaryCalculator.tsx` | Main component with inputs and live output |
| `src/SalaryCalculator.test.tsx` | Unit tests for calculation logic |

## Files NOT to touch
- Everything not listed above

## Dependencies
- None (React only)

## Test requirements
- Unit tests for the four rate calculations
- Coverage target: 80% lines minimum

## Assumptions
- No currency formatting or locale selector
- No validation or error states
- Plain inline styles — no CSS files or design system

## Out of scope
- Currency selection, validation, saving/exporting results
