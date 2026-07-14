/** Shared type definitions for Scenic Route Explorer. */

export interface Waypoint {
  lat: number;
  lng: number;
}

export type RoadType = 'Paved' | 'Gravel' | 'Mixed';
export type DistanceFilter = 'all' | 'short' | 'medium' | 'long';
export type ReactionEmoji = '👍' | '🔥' | '🌄' | '😍';

export interface Route {
  id: string;
  name: string;
  region: string;
  distance: number;
  driveTime: string;
  curvatureRating: number;
  roadType: RoadType;
  highlights: string;
  waypoints: Waypoint[];
  startPoint: string;
  endPoint: string;
  directions: string[];
  bestSeason: string;
}

export type ReactionCounts = Record<ReactionEmoji, number>;
export type UserReactions = Record<ReactionEmoji, boolean>;

export interface Comment {
  id: string;
  routeId: string;
  username: string;
  timestamp: string;
  text: string;
}

export const REACTION_EMOJIS: ReactionEmoji[] = ['👍', '🔥', '🌄', '😍'];

export const DISTANCE_LABELS: Record<DistanceFilter, string> = {
  all: 'All',
  short: 'Short (<50 mi)',
  medium: 'Medium (50–150 mi)',
  long: 'Long (150+ mi)',
};
