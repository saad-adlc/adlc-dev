# Spec: Profit Margin Calculator

**Issue:** TBD
**Stack:** React
**Branch:** feature/issue-tbd-profit-margin-calculator
**Workspace:** workspaces/issue-tbd-profit-margin-calculator/
**Date:** 2026-06-04

## What we're building
A lightweight standalone React component that accepts a Revenue and Total Cost
figure, then instantly displays Gross Margin %, Net Profit, and a RAG health
bar indicating margin health. No persistence — calculate and display only.

## Acceptance criteria
1. [ ] User enters Revenue and Total Cost; results update on every keystroke
2. [ ] Gross Margin % displayed as ((Revenue - Cost) / Revenue) × 100
3. [ ] Net Profit displayed as Revenue - Total Cost
4. [ ] RAG health bar reflects margin %: red < 10%, amber 10–25%, green > 25%
5. [ ] Invalid / empty / zero-revenue inputs show a safe fallback (no crash, no NaN)
6. [ ] Component is visually light — minimal chrome, clear numbers

## Files to create
| Path | Purpose |
|------|---------|
| `src/ProfitMarginCalculator.tsx` | Main calculator component |
| `src/ProfitMarginCalculator.test.tsx` | Unit tests |

## Files to modify
| Path | Change |
|------|--------|
| `src/App.tsx` | Mount the calculator component |

## Files NOT to touch
- Everything not listed above

## Dependencies
- None (React + testing library already present in Vite scaffold)

## Test requirements
- Unit tests for: margin % calculation, net profit calculation, RAG threshold logic, zero/empty input handling
- Coverage target: 80% lines minimum
- Test file: `src/ProfitMarginCalculator.test.tsx`

## Assumptions
- RAG thresholds: red < 10%, amber 10–25%, green > 25%
- No currency selector — values treated as plain numbers
- Vite + React scaffold used for standalone delivery

## Out of scope
- Multi-currency support
- Persistence / save state
- COGS vs OpEx breakdown
- Export or print
