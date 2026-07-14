import { Route, Comment, ReactionCounts, UserReactions, ReactionEmoji, REACTION_EMOJIS } from './types';
import { SEED_ROUTES } from './seed-data';

const KEYS = {
  ROUTES: 'sre_routes',
  COMMENTS: 'sre_comments',
  REACTIONS: 'sre_reactions',
  USER_REACTIONS: 'sre_user_reactions',
  USERNAME: 'sre_username',
} as const;

/** Returns a zero-count ReactionCounts map for all emojis. */
function defaultReactionCounts(): ReactionCounts {
  return Object.fromEntries(REACTION_EMOJIS.map(e => [e, 0])) as ReactionCounts;
}

/** Returns a false UserReactions map for all emojis. */
function defaultUserReactions(): UserReactions {
  return Object.fromEntries(REACTION_EMOJIS.map(e => [e, false])) as UserReactions;
}

/** Generates a random alphanumeric ID string. */
function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** Returns (or creates and stores) the auto-generated username for this browser. */
export function getUsername(): string {
  const stored = localStorage.getItem(KEYS.USERNAME);
  if (stored) return stored;
  const username = `Driver${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem(KEYS.USERNAME, username);
  return username;
}

/** Returns all routes from localStorage, seeding from defaults on first load. */
export function getRoutes(): Route[] {
  const stored = localStorage.getItem(KEYS.ROUTES);
  if (!stored) {
    localStorage.setItem(KEYS.ROUTES, JSON.stringify(SEED_ROUTES));
    return SEED_ROUTES;
  }
  return JSON.parse(stored) as Route[];
}

/** Persists a new route (without id) and returns it with a generated id. */
export function addRoute(route: Omit<Route, 'id'>): Route {
  const routes = getRoutes();
  const newRoute: Route = { ...route, id: generateId() };
  routes.push(newRoute);
  localStorage.setItem(KEYS.ROUTES, JSON.stringify(routes));
  return newRoute;
}

/** Returns all comments for a specific route, sorted by insertion order. */
export function getComments(routeId: string): Comment[] {
  const stored = localStorage.getItem(KEYS.COMMENTS);
  const all: Comment[] = stored ? (JSON.parse(stored) as Comment[]) : [];
  return all.filter(c => c.routeId === routeId);
}

/** Adds a comment to a route, persists it, and returns the new comment. */
export function addComment(routeId: string, text: string, username: string): Comment {
  const stored = localStorage.getItem(KEYS.COMMENTS);
  const all: Comment[] = stored ? (JSON.parse(stored) as Comment[]) : [];
  const comment: Comment = {
    id: generateId(),
    routeId,
    username,
    timestamp: new Date().toISOString(),
    text,
  };
  all.push(comment);
  localStorage.setItem(KEYS.COMMENTS, JSON.stringify(all));
  return comment;
}

/** Returns the current reaction counts for a route. */
export function getReactions(routeId: string): ReactionCounts {
  const stored = localStorage.getItem(KEYS.REACTIONS);
  const all: Record<string, ReactionCounts> = stored ? JSON.parse(stored) : {};
  return all[routeId] ?? defaultReactionCounts();
}

/** Returns which emojis the current user has reacted with on a route. */
export function getUserReactions(routeId: string): UserReactions {
  const stored = localStorage.getItem(KEYS.USER_REACTIONS);
  const all: Record<string, UserReactions> = stored ? JSON.parse(stored) : {};
  return all[routeId] ?? defaultUserReactions();
}

/** Toggles an emoji reaction for a route, persisting updated counts and user state. */
export function toggleReaction(
  routeId: string,
  emoji: ReactionEmoji,
): { reactions: ReactionCounts; userReactions: UserReactions } {
  const reactions = getReactions(routeId);
  const userReactions = getUserReactions(routeId);
  const wasActive = userReactions[emoji];
  userReactions[emoji] = !wasActive;
  reactions[emoji] = wasActive ? Math.max(0, reactions[emoji] - 1) : reactions[emoji] + 1;

  const storedR = localStorage.getItem(KEYS.REACTIONS);
  const allR: Record<string, ReactionCounts> = storedR ? JSON.parse(storedR) : {};
  allR[routeId] = reactions;
  localStorage.setItem(KEYS.REACTIONS, JSON.stringify(allR));

  const storedU = localStorage.getItem(KEYS.USER_REACTIONS);
  const allU: Record<string, UserReactions> = storedU ? JSON.parse(storedU) : {};
  allU[routeId] = userReactions;
  localStorage.setItem(KEYS.USER_REACTIONS, JSON.stringify(allU));

  return { reactions, userReactions };
}
