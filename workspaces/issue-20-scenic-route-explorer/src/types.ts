/** Latitude/longitude coordinate on a route path. */
export interface Waypoint {
  lat: number;
  lng: number;
}

export type RoadType = 'Paved' | 'Gravel' | 'Mixed';

export type DistanceFilter = 'all' | 'short' | 'medium' | 'long';

export type ReactionEmoji = '👍' | '🔥' | '🌄' | '😍';

/** All supported emoji reactions, in display order. */
export const REACTION_EMOJIS: ReactionEmoji[] = ['👍', '🔥', '🌄', '😍'];

/** A scenic driving route. */
export interface Route {
  id: string;
  name: string;
  region: string;
  /** Miles */
  distance: number;
  /** Human-readable, e.g. "2h 30m" */
  driveTime: string;
  roadType: RoadType;
  /** 1–5 twisties */
  curvatureRating: number;
  highlights: string;
  startPoint: string;
  endPoint: string;
  /** Turn-by-turn narrative steps */
  directions: string[];
  waypoints: Waypoint[];
  bestSeason: string;
}

/** Reaction state for a single route. */
export interface RouteReactions {
  counts: Record<ReactionEmoji, number>;
  /** Emojis the current user has toggled on */
  toggled: ReactionEmoji[];
}

/** A user comment on a route. */
export interface Comment {
  id: string;
  routeId: string;
  username: string;
  text: string;
  /** ISO 8601 */
  timestamp: string;
}

/** All persisted application data. */
export interface AppData {
  routes: Route[];
  reactions: Record<string, RouteReactions>;
  comments: Comment[];
  username: string;
}
