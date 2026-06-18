import type { Route, DistanceFilter, RoadType } from './types';

const SHORT_MAX = 50;
const MEDIUM_MAX = 150;

/** Return true if distance matches the selected bucket. */
export function matchesDistance(distance: number, filter: DistanceFilter): boolean {
  if (filter === 'short') return distance < SHORT_MAX;
  if (filter === 'medium') return distance >= SHORT_MAX && distance <= MEDIUM_MAX;
  if (filter === 'long') return distance > MEDIUM_MAX;
  return true;
}

/** Return routes passing all active filters. */
export function filterRoutes(
  routes: Route[],
  searchQuery: string,
  regionFilter: string,
  distanceFilter: DistanceFilter,
  roadTypeFilter: RoadType[],
): Route[] {
  const q = searchQuery.toLowerCase().trim();
  return routes.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q) && !r.region.toLowerCase().includes(q)) {
      return false;
    }
    if (regionFilter && regionFilter !== 'all' && r.region !== regionFilter) {
      return false;
    }
    if (distanceFilter !== 'all' && !matchesDistance(r.distance, distanceFilter)) {
      return false;
    }
    if (roadTypeFilter.length > 0 && !roadTypeFilter.includes(r.roadType)) {
      return false;
    }
    return true;
  });
}

/** Collect unique region strings from a route list, sorted. */
export function getRegions(routes: Route[]): string[] {
  return [...new Set(routes.map((r) => r.region))].sort();
}
