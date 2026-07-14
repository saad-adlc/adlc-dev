import { beforeEach, describe, expect, it } from 'vitest';
import {
  getUsername,
  getRoutes,
  addRoute,
  getComments,
  addComment,
  getReactions,
  getUserReactions,
  toggleReaction,
} from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  describe('getUsername', () => {
    it('creates a username matching Driver#### on first call', () => {
      const username = getUsername();
      expect(username).toMatch(/^Driver\d{4}$/);
    });

    it('returns the same username on subsequent calls', () => {
      const first = getUsername();
      const second = getUsername();
      expect(first).toBe(second);
    });
  });

  describe('getRoutes', () => {
    it('seeds routes on first load', () => {
      const routes = getRoutes();
      expect(routes.length).toBeGreaterThan(0);
    });

    it('returns stored routes without re-seeding', () => {
      const seed = getRoutes();
      const again = getRoutes();
      expect(again.length).toBe(seed.length);
    });
  });

  describe('addRoute', () => {
    it('adds a route and returns it with an id', () => {
      const before = getRoutes().length;
      const added = addRoute({
        name: 'Test Route',
        region: 'Test Region',
        distance: 50,
        driveTime: '1h',
        curvatureRating: 3,
        roadType: 'Paved',
        highlights: 'nice',
        waypoints: [],
        startPoint: 'A',
        endPoint: 'B',
        directions: [],
        bestSeason: 'Summer',
      });
      expect(added.id).toBeTruthy();
      expect(getRoutes().length).toBe(before + 1);
    });

    it('persists the route name', () => {
      addRoute({
        name: 'Persisted Route',
        region: 'R',
        distance: 10,
        driveTime: '30m',
        curvatureRating: 1,
        roadType: 'Gravel',
        highlights: '',
        waypoints: [],
        startPoint: '',
        endPoint: '',
        directions: [],
        bestSeason: 'Summer',
      });
      const routes = getRoutes();
      expect(routes.some(r => r.name === 'Persisted Route')).toBe(true);
    });
  });

  describe('getComments / addComment', () => {
    it('returns empty array for a route with no comments', () => {
      expect(getComments('no-such-route')).toEqual([]);
    });

    it('adds a comment and retrieves it', () => {
      const comment = addComment('route-1', 'Great drive!', 'Driver1234');
      expect(comment.text).toBe('Great drive!');
      expect(comment.username).toBe('Driver1234');
      expect(comment.routeId).toBe('route-1');
      expect(comment.id).toBeTruthy();
    });

    it('only returns comments for the given routeId', () => {
      addComment('route-A', 'For A', 'DriverA');
      addComment('route-B', 'For B', 'DriverB');
      const forA = getComments('route-A');
      expect(forA).toHaveLength(1);
      expect(forA[0].text).toBe('For A');
    });
  });

  describe('getReactions / toggleReaction', () => {
    it('returns zero counts for an unseen route', () => {
      const r = getReactions('new-route');
      expect(r['👍']).toBe(0);
      expect(r['🔥']).toBe(0);
    });

    it('getUserReactions returns all false for an unseen route', () => {
      const ur = getUserReactions('new-route');
      expect(ur['👍']).toBe(false);
    });

    it('toggles a reaction count up', () => {
      const { reactions } = toggleReaction('route-x', '👍');
      expect(reactions['👍']).toBe(1);
    });

    it('toggles a reaction count back down when activated twice', () => {
      toggleReaction('route-x', '🔥');
      const { reactions } = toggleReaction('route-x', '🔥');
      expect(reactions['🔥']).toBe(0);
    });

    it('persists reaction state across reads', () => {
      toggleReaction('route-y', '🌄');
      const r = getReactions('route-y');
      expect(r['🌄']).toBe(1);
    });

    it('does not decrement below zero', () => {
      const { reactions } = toggleReaction('route-z', '😍');
      expect(reactions['😍']).toBeGreaterThanOrEqual(0);
    });
  });
});
