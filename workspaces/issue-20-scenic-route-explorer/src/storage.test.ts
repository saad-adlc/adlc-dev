import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateUsername,
  defaultReactions,
  loadAppData,
  saveRoutes,
  saveReactions,
  saveComments,
  toggleReaction,
} from './storage';
import type { ReactionEmoji } from './types';
import { SEED_ROUTES } from './seed-data';

function setupStorage(overrides: Record<string, string> = {}) {
  const store: Record<string, string> = { ...overrides };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((k) => store[k] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { store[k] = v; });
  return store;
}

describe('generateUsername', () => {
  it('returns a string starting with Driver', () => {
    expect(generateUsername()).toMatch(/^Driver\d{4}$/);
  });
  it('generates different usernames on repeated calls', () => {
    const names = new Set(Array.from({ length: 20 }, generateUsername));
    expect(names.size).toBeGreaterThan(1);
  });
});

describe('defaultReactions', () => {
  it('initialises all emoji counts to 0', () => {
    const r = defaultReactions();
    expect(r.counts['👍']).toBe(0);
    expect(r.counts['🔥']).toBe(0);
    expect(r.counts['🌄']).toBe(0);
    expect(r.counts['😍']).toBe(0);
    expect(r.toggled).toEqual([]);
  });
});

describe('loadAppData', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns seed routes when localStorage is empty', () => {
    setupStorage();
    const data = loadAppData();
    expect(data.routes).toEqual(SEED_ROUTES);
  });

  it('returns stored routes when localStorage has data', () => {
    setupStorage({ 'sre:routes': JSON.stringify([SEED_ROUTES[0]]) });
    const data = loadAppData();
    expect(data.routes).toHaveLength(1);
    expect(data.routes[0].id).toBe('seed-1');
  });

  it('returns empty comments array when localStorage is empty', () => {
    setupStorage();
    const data = loadAppData();
    expect(data.comments).toEqual([]);
  });

  it('returns stored comments', () => {
    const comments = [{ id: 'c1', routeId: 'seed-1', username: 'Driver1234', text: 'Great!', timestamp: '2026-01-01T00:00:00Z' }];
    setupStorage({ 'sre:comments': JSON.stringify(comments) });
    const data = loadAppData();
    expect(data.comments[0].id).toBe('c1');
  });

  it('uses existing username from localStorage', () => {
    setupStorage({ 'sre:username': 'Driver9999' });
    const data = loadAppData();
    expect(data.username).toBe('Driver9999');
  });

  it('generates and stores a username when none exists', () => {
    const store = setupStorage();
    const data = loadAppData();
    expect(data.username).toMatch(/^Driver\d{4}$/);
    expect(store['sre:username']).toBe(data.username);
  });
});

describe('saveRoutes / saveReactions / saveComments', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('serialises routes to localStorage', () => {
    const store = setupStorage();
    saveRoutes([SEED_ROUTES[0]]);
    expect(JSON.parse(store['sre:routes'])[0].id).toBe('seed-1');
  });

  it('serialises reactions to localStorage', () => {
    const store = setupStorage();
    const r = { 'seed-1': defaultReactions() };
    saveReactions(r);
    expect(JSON.parse(store['sre:reactions'])['seed-1']).toBeDefined();
  });

  it('serialises comments to localStorage', () => {
    const store = setupStorage();
    saveComments([{ id: 'c1', routeId: 'r1', username: 'D', text: 'Hi', timestamp: 't' }]);
    expect(JSON.parse(store['sre:comments'])[0].id).toBe('c1');
  });
});

describe('toggleReaction', () => {
  const emoji: ReactionEmoji = '👍';

  it('increments count on first toggle', () => {
    const result = toggleReaction({}, 'seed-1', emoji);
    expect(result['seed-1'].counts[emoji]).toBe(1);
    expect(result['seed-1'].toggled).toContain(emoji);
  });

  it('decrements count on second toggle (un-toggle)', () => {
    const first = toggleReaction({}, 'seed-1', emoji);
    const second = toggleReaction(first, 'seed-1', emoji);
    expect(second['seed-1'].counts[emoji]).toBe(0);
    expect(second['seed-1'].toggled).not.toContain(emoji);
  });

  it('does not go below 0 when toggling off a zero count', () => {
    const reactions = { 'seed-1': { ...defaultReactions(), toggled: [emoji] } };
    const result = toggleReaction(reactions, 'seed-1', emoji);
    expect(result['seed-1'].counts[emoji]).toBe(0);
  });

  it('preserves other emoji counts when toggling one', () => {
    const fire: ReactionEmoji = '🔥';
    const first = toggleReaction({}, 'seed-1', fire);
    const second = toggleReaction(first, 'seed-1', emoji);
    expect(second['seed-1'].counts[fire]).toBe(1);
    expect(second['seed-1'].counts[emoji]).toBe(1);
  });

  it('preserves other route reactions', () => {
    const initial = { 'seed-2': { counts: { '👍': 5, '🔥': 0, '🌄': 0, '😍': 0 }, toggled: [] } };
    const result = toggleReaction(initial, 'seed-1', emoji);
    expect(result['seed-2'].counts['👍']).toBe(5);
  });
});
