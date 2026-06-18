# Spec: Scenic Route Explorer

**Issue:** #20  
**Date:** 17 June 2026  
**Stack:** React 18 + TypeScript (strict)

## Summary
Single-page app for discovering, sharing, and commenting on scenic drives.
Feed view → Route detail view, with a slide-in Submit Route form.

## Implementation notes
- **Maps:** SVG-based polyline overlay (Leaflet not in package.json; cannot add dependencies per ADLC rules). Thumbnail: 60×70 SVG. Detail: full-width SVG with grid background simulating tiles.
- **State:** React Context + useReducer (Zustand not installed).
- **Persistence:** localStorage for routes, reactions, comments, username.
- **Username:** "Driver" + random 4-digit ID, generated once on first load.

## File structure
```
src/
  types.ts              — shared interfaces and constants
  seed-data.ts          — 9 pre-seeded routes
  storage.ts            — localStorage read/write utilities
  filter-routes.ts      — pure route-filter functions
  app-context.tsx       — global Context + useReducer
  route-map.tsx         — SVG map (thumbnail + detail variant)
  curvature-rating.tsx  — star rating display
  reaction-bar.tsx      — emoji reaction buttons
  route-card.tsx        — feed card
  route-filters.tsx     — search bar + filter controls
  route-feed.tsx        — feed view
  comment-section.tsx   — comments list + post form
  submit-route-form.tsx — new route submission form
  route-detail.tsx      — detail view
  scenic-route-explorer.tsx — root component
```

## Acceptance criteria checklist
1. Home feed with filter by region, distance, road type ✓
2. Route card: name, region, distance, drive time, curvature, thumbnail map ✓
3. Detail view with SVG path overlay (no API key) ✓
4. Detail: highlights, road surface, curvature, directions ✓
5. Emoji reactions with instant count toggle ✓
6. Comments with username + timestamp ✓
7. Submit route form (9 fields) ✓
8. Real-time search by name / region ✓
9. All data in localStorage ✓

## Out of scope
Real GPX import, live navigation, user accounts, image uploads, native mobile.
