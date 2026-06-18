import { Route, DistanceFilter, RoadType } from './types';

/** Returns true if a route distance matches the given filter bucket. */
function matchesDistance(distance: number, filter: DistanceFilter): boolean {
  if (filter === 'short') return distance < 50;
  if (filter === 'medium') return distance >= 50 && distance <= 150;
  if (filter === 'long') return distance > 150;
  return true;
}

/**
 * Filters a route list by search text, region, distance bucket, and road types.
 * All active filters are AND-combined.
 */
export function filterRoutes(
  routes: Route[],
  search: string,
  region: string,
  distanceFilter: DistanceFilter,
  roadTypeFilters: RoadType[],
): Route[] {
  const lower = search.toLowerCase();
  return routes.filter(route => {
    if (lower) {
      const nameMatch = route.name.toLowerCase().includes(lower);
      const regionMatch = route.region.toLowerCase().includes(lower);
      if (!nameMatch && !regionMatch) return false;
    }
    if (region && route.region !== region) return false;
    if (!matchesDistance(route.distance, distanceFilter)) return false;
    if (roadTypeFilters.length > 0 && !roadTypeFilters.includes(route.roadType)) return false;
    return true;
  });
}

/** Returns a sorted list of unique region names from a route array. */
export function getRegions(routes: Route[]): string[] {
  return [...new Set(routes.map(r => r.region))].sort();
}
