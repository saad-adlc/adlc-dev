import type { AppData, Comment, Route, RouteReactions, ReactionEmoji } from './types';
import { REACTION_EMOJIS } from './types';
import { SEED_ROUTES } from './seed-data';

const KEYS = {
  routes: 'sre:routes',
  reactions: 'sre:reactions',
  comments: 'sre:comments',
  username: 'sre:username',
} as const;

/** Generate a username like "Driver1234". */
export function generateUsername(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Driver${digits}`;
}

/** Build default reaction state for a route. */
export function defaultReactions(): RouteReactions {
  const counts = {} as Record<ReactionEmoji, number>;
  for (const emoji of REACTION_EMOJIS) counts[emoji] = 0;
  return { counts, toggled: [] };
}

/** Load all app data from localStorage, seeding routes on first load. */
export function loadAppData(): AppData {
  const routesRaw = localStorage.getItem(KEYS.routes);
  const routes: Route[] = routesRaw ? (JSON.parse(routesRaw) as Route[]) : SEED_ROUTES;

  const reactionsRaw = localStorage.getItem(KEYS.reactions);
  const reactions: Record<string, RouteReactions> = reactionsRaw
    ? (JSON.parse(reactionsRaw) as Record<string, RouteReactions>)
    : {};

  const commentsRaw = localStorage.getItem(KEYS.comments);
  const comments: Comment[] = commentsRaw ? (JSON.parse(commentsRaw) as Comment[]) : [];

  const usernameRaw = localStorage.getItem(KEYS.username);
  const username = usernameRaw ?? generateUsername();
  if (!usernameRaw) localStorage.setItem(KEYS.username, username);

  return { routes, reactions, comments, username };
}

/** Persist routes to localStorage. */
export function saveRoutes(routes: Route[]): void {
  localStorage.setItem(KEYS.routes, JSON.stringify(routes));
}

/** Persist reactions to localStorage. */
export function saveReactions(reactions: Record<string, RouteReactions>): void {
  localStorage.setItem(KEYS.reactions, JSON.stringify(reactions));
}

/** Persist comments to localStorage. */
export function saveComments(comments: Comment[]): void {
  localStorage.setItem(KEYS.comments, JSON.stringify(comments));
}

/** Toggle an emoji reaction for a route, returning the updated reactions map. */
export function toggleReaction(
  reactions: Record<string, RouteReactions>,
  routeId: string,
  emoji: ReactionEmoji,
): Record<string, RouteReactions> {
  const existing = reactions[routeId] ?? defaultReactions();
  const isToggled = existing.toggled.includes(emoji);
  const newCounts = { ...existing.counts };
  newCounts[emoji] = isToggled
    ? Math.max(0, existing.counts[emoji] - 1)
    : existing.counts[emoji] + 1;
  const newToggled = isToggled
    ? existing.toggled.filter((e) => e !== emoji)
    : [...existing.toggled, emoji];
  return {
    ...reactions,
    [routeId]: { counts: newCounts, toggled: newToggled },
  };
}
