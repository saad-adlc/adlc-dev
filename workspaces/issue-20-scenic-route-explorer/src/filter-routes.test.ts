import { describe, it, expect } from 'vitest';
import { filterRoutes, matchesDistance, getRegions } from './filter-routes';
import { SEED_ROUTES } from './seed-data';
import type { Route } from './types';

describe('matchesDistance', () => {
  it('short: distance < 50', () => {
    expect(matchesDistance(49, 'short')).toBe(true);
    expect(matchesDistance(50, 'short')).toBe(false);
  });
  it('medium: 50 <= distance <= 150', () => {
    expect(matchesDistance(50, 'medium')).toBe(true);
    expect(matchesDistance(100, 'medium')).toBe(true);
    expect(matchesDistance(150, 'medium')).toBe(true);
    expect(matchesDistance(151, 'medium')).toBe(false);
    expect(matchesDistance(49, 'medium')).toBe(false);
  });
  it('long: distance > 150', () => {
    expect(matchesDistance(151, 'long')).toBe(true);
    expect(matchesDistance(150, 'long')).toBe(false);
  });
  it('all: always true', () => {
    expect(matchesDistance(0, 'all')).toBe(true);
    expect(matchesDistance(9999, 'all')).toBe(true);
  });
});

describe('filterRoutes', () => {
  it('returns all routes when no filters active', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'all', []);
    expect(result).toHaveLength(SEED_ROUTES.length);
  });

  it('filters by name (case-insensitive)', () => {
    const result = filterRoutes(SEED_ROUTES, 'pacific', 'all', 'all', []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pacific Coast Highway');
  });

  it('filters by region (case-insensitive)', () => {
    const result = filterRoutes(SEED_ROUTES, 'switzerland', 'all', 'all', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('seed-9');
  });

  it('returns empty when query matches nothing', () => {
    const result = filterRoutes(SEED_ROUTES, 'zzznomatch', 'all', 'all', []);
    expect(result).toHaveLength(0);
  });

  it('filters by exact region', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'California, USA', 'all', []);
    expect(result.every((r) => r.region === 'California, USA')).toBe(true);
  });

  it('ignores region filter when set to all', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'all', []);
    expect(result.length).toBe(SEED_ROUTES.length);
  });

  it('filters by short distance', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'short', []);
    expect(result.every((r) => r.distance < 50)).toBe(true);
  });

  it('filters by medium distance', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'medium', []);
    expect(result.every((r) => r.distance >= 50 && r.distance <= 150)).toBe(true);
  });

  it('filters by long distance', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'long', []);
    expect(result.every((r) => r.distance > 150)).toBe(true);
  });

  it('filters by road type', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'all', ['Gravel']);
    expect(result.every((r) => r.roadType === 'Gravel')).toBe(true);
  });

  it('filters by multiple road types', () => {
    const result = filterRoutes(SEED_ROUTES, '', 'all', 'all', ['Paved', 'Mixed']);
    expect(result.every((r) => r.roadType === 'Paved' || r.roadType === 'Mixed')).toBe(true);
  });

  it('combines search and distance filter', () => {
    const result = filterRoutes(SEED_ROUTES, 'pass', 'all', 'short', []);
    expect(result.every((r) => r.distance < 50)).toBe(true);
    expect(result.every((r) =>
      r.name.toLowerCase().includes('pass') || r.region.toLowerCase().includes('pass')
    )).toBe(true);
  });

  it('trims search query whitespace', () => {
    const result = filterRoutes(SEED_ROUTES, '  pacific  ', 'all', 'all', []);
    expect(result.length).toBe(1);
  });

  it('handles routes with empty array', () => {
    const result = filterRoutes([], 'anything', 'all', 'all', []);
    expect(result).toHaveLength(0);
  });

  it('returns empty when road type filter matches none', () => {
    const routes: Route[] = [{ ...SEED_ROUTES[0], roadType: 'Paved' }];
    const result = filterRoutes(routes, '', 'all', 'all', ['Gravel']);
    expect(result).toHaveLength(0);
  });
});

describe('getRegions', () => {
  it('returns sorted unique regions', () => {
    const regions = getRegions(SEED_ROUTES);
    expect(regions).toEqual([...regions].sort());
    expect(new Set(regions).size).toBe(regions.length);
  });

  it('returns empty array for empty routes', () => {
    expect(getRegions([])).toEqual([]);
  });
});
