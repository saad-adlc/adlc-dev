# Spec: Scenic Route Explorer

**Issue:** #21  
**Date:** 17 June 2026  
**Stack:** React 18 + TypeScript 5 (strict), Vite 5, Vitest 2

## What we're building

A React SPA that lets drivers discover, share, and discuss the best scenic drives. Users browse a curated feed of route cards, view route details on an SVG path overlay map (no external map API required), react with emoji, comment, and submit their own routes.

## Architecture

### Data model

| Entity | Key fields |
|---|---|
| `Route` | id, name, region, distance (mi), driveTime, curvatureRating (1–5), roadType (Paved/Gravel/Mixed), highlights, waypoints (lat/lng[]), startPoint, endPoint, directions[], bestSeason |
| `Comment` | id, routeId, username, timestamp (ISO string), text |
| `ReactionCounts` | Record<ReactionEmoji, number> |
| `UserReactions` | Record<ReactionEmoji, boolean> |

### Persistence

All data lives in `localStorage` under prefixed keys (`sre_routes`, `sre_comments`, `sre_reactions`, `sre_user_reactions`, `sre_username`).  
9 seed routes are written on first load if no routes are stored.

### State management

React `useState` only — no external state library required.  
Top-level state in `ScenicRouteExplorer`: routes list, selected route ID, and show-form flag.  
Feed filter state (search, region, distance, road type) lives in `RouteFeed`.

### Map

Leaflet is not in the installed dependencies. Routes are visualised as an SVG equirectangular projection of pre-seeded `lat/lng` waypoints. Blue dashed polyline, blue start dot, red end dot. Two variants: `thumbnail` (60 × 70 px) and `detail` (full-width × 220 px).

## File structure

```
src/
  vite-env.d.ts              — Vite CSS module type reference
  types.ts                   — shared interfaces and type aliases
  seed-data.ts               — 9 pre-seeded routes
  storage.ts                 — localStorage read/write helpers
  route-filtering.ts         — pure filter/region helpers
  curvature-rating.tsx       — ★ star display component
  route-map.tsx              — SVG route path visualisation
  reaction-bar.tsx           — emoji reaction buttons with counts
  comment-section.tsx        — comment list + post form
  route-form.tsx             — submit-route modal form
  route-card.tsx             — feed card (thumbnail + info + reactions)
  route-feed.tsx             — feed view with search/filter controls
  route-detail.tsx           — detail view (map, directions, comments)
  scenic-route-explorer.tsx  — root component, mounts in App.tsx
  *.module.css               — CSS Modules (one per component)
  *.test.ts / *.test.tsx     — unit tests
```

## Acceptance criteria mapping

| AC | Implementation |
|---|---|
| 1. Feed with region/distance/road type filters | `RouteFeed` + `filterRoutes()` |
| 2. Route card with all metadata | `RouteCard` |
| 3. Interactive map with route path | `RouteMap` (SVG, no API key) |
| 4. Route detail: highlights, surface, curvature, directions | `RouteDetail` |
| 5. Emoji reactions (toggle, instant count) | `ReactionBar` + `toggleReaction()` |
| 6. Comments with username and timestamp | `CommentSection` + `addComment()` |
| 7. Route submission form | `RouteForm` (modal) |
| 8. Real-time search by name/region | `filterRoutes()` inside `RouteFeed` |
| 9. All data in localStorage | `storage.ts` |

## Definition of done

- `npm run ci` passes (typecheck + lint + test:coverage)
- Line coverage ≥ 80% across all source files
- No hardcoded secrets, no `any`, no TODO comments
- Zero ESLint warnings
