import { describe, expect, it } from 'vitest';
import { filterRoutes, getRegions } from './route-filtering';
import { Route } from './types';

const ROUTES: Route[] = [
  {
    id: '1', name: 'Pacific Coast Highway', region: 'Pacific Coast', distance: 123,
    driveTime: '3h', curvatureRating: 3, roadType: 'Paved', highlights: '',
    waypoints: [], startPoint: '', endPoint: '', directions: [], bestSeason: '',
  },
  {
    id: '2', name: 'Tail of the Dragon', region: 'Smoky Mountains', distance: 11,
    driveTime: '45m', curvatureRating: 5, roadType: 'Paved', highlights: '',
    waypoints: [], startPoint: '', endPoint: '', directions: [], bestSeason: '',
  },
  {
    id: '3', name: 'Forest Gravel Loop', region: 'Pacific Northwest', distance: 40,
    driveTime: '2h', curvatureRating: 2, roadType: 'Gravel', highlights: '',
    waypoints: [], startPoint: '', endPoint: '', directions: [], bestSeason: '',
  },
  {
    id: '4', name: 'Alpine Pass', region: 'Rocky Mountains', distance: 200,
    driveTime: '5h', curvatureRating: 4, roadType: 'Mixed', highlights: '',
    waypoints: [], startPoint: '', endPoint: '', directions: [], bestSeason: '',
  },
];

describe('filterRoutes', () => {
  it('returns all routes when no filters are active', () => {
    expect(filterRoutes(ROUTES, '', '', 'all', [])).toHaveLength(4);
  });

  it('filters by search term matching name (case-insensitive)', () => {
    const result = filterRoutes(ROUTES, 'dragon', '', 'all', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by search term matching region', () => {
    const result = filterRoutes(ROUTES, 'pacific', '', 'all', []);
    expect(result).toHaveLength(2);
  });

  it('filters by exact region', () => {
    const result = filterRoutes(ROUTES, '', 'Rocky Mountains', 'all', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('filters by distance: short (<50 mi)', () => {
    const result = filterRoutes(ROUTES, '', '', 'short', []);
    expect(result.every(r => r.distance < 50)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('filters by distance: medium (50–150 mi)', () => {
    const result = filterRoutes(ROUTES, '', '', 'medium', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by distance: long (>150 mi)', () => {
    const result = filterRoutes(ROUTES, '', '', 'long', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('filters by single road type', () => {
    const result = filterRoutes(ROUTES, '', '', 'all', ['Gravel']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('filters by multiple road types (OR within the type group)', () => {
    const result = filterRoutes(ROUTES, '', '', 'all', ['Gravel', 'Mixed']);
    expect(result).toHaveLength(2);
  });

  it('combines search and distance filters', () => {
    const result = filterRoutes(ROUTES, 'pacific', '', 'medium', []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty when no routes match', () => {
    const result = filterRoutes(ROUTES, 'nonexistent-xyz', '', 'all', []);
    expect(result).toHaveLength(0);
  });
});

describe('getRegions', () => {
  it('returns sorted unique regions', () => {
    const regions = getRegions(ROUTES);
    expect(regions).toEqual(['Pacific Coast', 'Pacific Northwest', 'Rocky Mountains', 'Smoky Mountains']);
  });

  it('returns empty array for empty input', () => {
    expect(getRegions([])).toEqual([]);
  });
});
