/**
 * Persistence for download queue: saves and loads queue state from AsyncStorage.
 * Ensures download queue persists across app restarts.
 */
import { Dispatch, useEffect, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Action, QUEUE_STORAGE_KEY, State } from './downloadsTypes';

export const useSaveQueue = (state: State) => {
  const saveQueueRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (saveQueueRef.current) {
      clearTimeout(saveQueueRef.current);
    }

    const queue = state.queue;
    const isDownloading = state.isDownloading;
    const activeIds = state.activeIds;
    const downloads = state.downloads;
    const hasCompleted = state.hasCompleted;
    const hasFailure = state.hasFailure;

    saveQueueRef.current = setTimeout(() => {
      AsyncStorage.setItem(
        QUEUE_STORAGE_KEY,
        JSON.stringify({
          queue,
          isDownloading,
          activeIds: Array.from(activeIds),
          downloads,
          hasCompleted,
          hasFailure,
        }),
      ).catch(console.error);
    }, 2000);

    return () => {
      if (saveQueueRef.current) {
        clearTimeout(saveQueueRef.current);
      }
    };
  }, [
    state.queue,
    state.isDownloading,
    state.activeIds,
    state.downloads,
    state.hasCompleted,
    state.hasFailure,
  ]);
};

export const useLoadQueue = (dispatch: Dispatch<Action>) => {
  useEffect(() => {
    const loadQueue = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      try {
        const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as any;
          if (parsed.queue?.length > 0 && !parsed.isDownloading) {
            dispatch({
              type: 'RESTORE',
              state: {
                ...parsed,
                activeIds: new Set(parsed.activeIds || []),
                isDownloading: false,
              },
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadQueue();
  }, [dispatch]);
};
