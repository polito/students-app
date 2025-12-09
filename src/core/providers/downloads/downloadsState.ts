/**
 * State management for downloads: reducers for main state and progress tracking.
 * Handles actions like adding/removing files, updating download status, and progress updates.
 */
import { Action, ProgressAction, State } from './downloadsTypes';

export const initialState: State = {
  downloads: {},
  queue: [],
  activeIds: new Set(),
  isDownloading: false,
  hasCompleted: false,
  hasFailure: false,
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_FILES':
      return {
        ...state,
        queue: [
          ...state.queue.filter(f => !action.files.some(nf => nf.id === f.id)),
          ...action.files,
        ],
      };
    case 'REMOVE_FILES':
      return {
        ...state,
        queue: state.queue.filter(f => !action.ids.includes(f.id)),
      };
    case 'UPDATE_DOWNLOAD':
      return {
        ...state,
        downloads: {
          ...state.downloads,
          [action.key]: { ...state.downloads[action.key], ...action.updates },
        },
      };
    case 'START_DOWNLOAD':
      return {
        ...state,
        isDownloading: true,
        activeIds: new Set(),
        hasCompleted: false,
        hasFailure: false,
      };
    case 'STOP_DOWNLOAD':
      return { ...state, isDownloading: false, activeIds: new Set() };
    case 'ADD_ACTIVE_ID':
      return {
        ...state,
        activeIds: new Set([...state.activeIds, action.id]),
      };
    case 'REMOVE_ACTIVE_ID': {
      const newIds = new Set(state.activeIds);
      newIds.delete(action.id);
      return { ...state, activeIds: newIds };
    }
    case 'SET_COMPLETED':
      return {
        ...state,
        isDownloading: false,
        queue: [],
        activeIds: new Set(),
        hasCompleted: true,
        hasFailure: false,
      };
    case 'SET_FAILURE':
      return { ...state, hasFailure: true };
    case 'RESET':
      return initialState;
    case 'RESTORE':
      return action.state;
    default:
      return state;
  }
};

export const progressReducer = (
  progressState: Record<string, number>,
  action: ProgressAction,
): Record<string, number> => {
  switch (action.type) {
    case 'UPDATE_PROGRESS':
      return { ...progressState, [action.key]: action.progress };
    case 'REMOVE_PROGRESS': {
      const newState = { ...progressState };
      delete newState[action.key];
      return newState;
    }
    default:
      return progressState;
  }
};
