import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Route, Comment, RouteReactions, ReactionEmoji, DistanceFilter, RoadType } from './types';
import { REACTION_EMOJIS } from './types';
import {
  loadAppData,
  saveRoutes,
  saveReactions,
  saveComments,
  toggleReaction as applyToggle,
  defaultReactions,
} from './storage';

interface AppState {
  routes: Route[];
  reactions: Record<string, RouteReactions>;
  comments: Comment[];
  username: string;
  selectedRouteId: string | null;
  searchQuery: string;
  regionFilter: string;
  distanceFilter: DistanceFilter;
  roadTypeFilter: RoadType[];
  showSubmitForm: boolean;
}

type Action =
  | { type: 'SELECT_ROUTE'; id: string | null }
  | { type: 'TOGGLE_REACTION'; routeId: string; emoji: ReactionEmoji }
  | { type: 'ADD_COMMENT'; comment: Comment }
  | { type: 'ADD_ROUTE'; route: Route }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_REGION'; region: string }
  | { type: 'SET_DISTANCE'; filter: DistanceFilter }
  | { type: 'TOGGLE_ROAD_TYPE'; roadType: RoadType }
  | { type: 'SET_SHOW_SUBMIT'; show: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_ROUTE':
      return { ...state, selectedRouteId: action.id, showSubmitForm: false };
    case 'TOGGLE_REACTION': {
      const reactions = applyToggle(state.reactions, action.routeId, action.emoji);
      saveReactions(reactions);
      return { ...state, reactions };
    }
    case 'ADD_COMMENT': {
      const comments = [...state.comments, action.comment];
      saveComments(comments);
      return { ...state, comments };
    }
    case 'ADD_ROUTE': {
      const routes = [...state.routes, action.route];
      saveRoutes(routes);
      return { ...state, routes };
    }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_REGION':
      return { ...state, regionFilter: action.region };
    case 'SET_DISTANCE':
      return { ...state, distanceFilter: action.filter };
    case 'TOGGLE_ROAD_TYPE': {
      const has = state.roadTypeFilter.includes(action.roadType);
      const roadTypeFilter = has
        ? state.roadTypeFilter.filter((t) => t !== action.roadType)
        : [...state.roadTypeFilter, action.roadType];
      return { ...state, roadTypeFilter };
    }
    case 'SET_SHOW_SUBMIT':
      return { ...state, showSubmitForm: action.show };
  }
}

interface AppContextValue {
  state: AppState;
  selectRoute: (id: string | null) => void;
  toggleReaction: (routeId: string, emoji: ReactionEmoji) => void;
  addComment: (routeId: string, text: string) => void;
  addRoute: (route: Route) => void;
  setSearchQuery: (q: string) => void;
  setRegionFilter: (r: string) => void;
  setDistanceFilter: (d: DistanceFilter) => void;
  toggleRoadTypeFilter: (rt: RoadType) => void;
  setShowSubmitForm: (show: boolean) => void;
  getReactions: (routeId: string) => RouteReactions;
  getComments: (routeId: string) => Comment[];
}

const AppContext = createContext<AppContextValue | null>(null);

const initial = loadAppData();

const initialState: AppState = {
  routes: initial.routes,
  reactions: initial.reactions,
  comments: initial.comments,
  username: initial.username,
  selectedRouteId: null,
  searchQuery: '',
  regionFilter: 'all',
  distanceFilter: 'all',
  roadTypeFilter: [],
  showSubmitForm: false,
};

/** Provides global scenic-route state to the component tree. */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectRoute = useCallback((id: string | null) => dispatch({ type: 'SELECT_ROUTE', id }), []);
  const toggleReaction = useCallback((routeId: string, emoji: ReactionEmoji) =>
    dispatch({ type: 'TOGGLE_REACTION', routeId, emoji }), []);
  const addComment = useCallback((routeId: string, text: string) => {
    const comment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      routeId,
      username: state.username,
      text,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', comment });
  }, [state.username]);
  const addRoute = useCallback((route: Route) => dispatch({ type: 'ADD_ROUTE', route }), []);
  const setSearchQuery = useCallback((q: string) => dispatch({ type: 'SET_SEARCH', query: q }), []);
  const setRegionFilter = useCallback((r: string) => dispatch({ type: 'SET_REGION', region: r }), []);
  const setDistanceFilter = useCallback((d: DistanceFilter) => dispatch({ type: 'SET_DISTANCE', filter: d }), []);
  const toggleRoadTypeFilter = useCallback((rt: RoadType) => dispatch({ type: 'TOGGLE_ROAD_TYPE', roadType: rt }), []);
  const setShowSubmitForm = useCallback((show: boolean) => dispatch({ type: 'SET_SHOW_SUBMIT', show }), []);
  const getReactions = useCallback((routeId: string): RouteReactions =>
    state.reactions[routeId] ?? defaultReactions(), [state.reactions]);
  const getComments = useCallback((routeId: string): Comment[] =>
    state.comments.filter((c) => c.routeId === routeId), [state.comments]);

  return (
    <AppContext.Provider value={{
      state, selectRoute, toggleReaction, addComment, addRoute,
      setSearchQuery, setRegionFilter, setDistanceFilter, toggleRoadTypeFilter,
      setShowSubmitForm, getReactions, getComments,
    }}>
      {children}
    </AppContext.Provider>
  );
}

/** Access global scenic-route state and actions. */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { REACTION_EMOJIS };
