/**
 * Queue management for downloads: processes the download queue with concurrency limits,
 * handles queue operations (add/remove files, start/stop downloads), and manages completion logic.
 */
import { Dispatch, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { stopDownload as fsStopDownload } from 'react-native-fs';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_CONCURRENT_DOWNLOADS } from '../../constants';
import {
  DownloadContext,
  DownloadPhase,
  QueuedFile,
} from '../../contexts/DownloadsContext';
import { useFeedbackContext } from '../../contexts/FeedbackContext';
import { getFileDatabase } from '../../database/FileDatabase';
import {
  checkPathsExist,
  findFileById,
  getFileKey,
  matchesContext,
  stopActiveDownload,
} from './downloadsFileUtils';
import {
  Action,
  ProgressAction,
  QUEUE_STORAGE_KEY,
  State,
} from './downloadsTypes';

const getDownloadAreaFromContextType = (
  contextType?: string,
): DownloadContext => {
  switch (contextType) {
    case 'course':
      return DownloadContext.Course;
    default:
      return DownloadContext.Course;
  }
};

interface UseQueueManagementParams {
  state: State;
  dispatch: Dispatch<Action>;
  dispatchProgress: Dispatch<ProgressAction>;
  downloadFile: (file: QueuedFile<DownloadContext>) => Promise<void>;
}

export const useQueueManagement = ({
  state,
  dispatch,
  dispatchProgress,
  downloadFile,
}: UseQueueManagementParams) => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const isProcessingQueueRef = useRef(false);
  const processQueueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const processQueue = useCallback(() => {
    if (isProcessingQueueRef.current) return;
    if (!state.isDownloading) return;

    isProcessingQueueRef.current = true;

    try {
      const currentActiveIds = new Set(state.activeIds);
      const currentQueue = [...state.queue];
      const currentDownloads = { ...state.downloads };

      const pending = currentQueue.filter(
        f =>
          !currentActiveIds.has(f.id) &&
          !currentDownloads[getFileKey(f)]?.isDownloaded,
      );
      let availableSlots = MAX_CONCURRENT_DOWNLOADS - currentActiveIds.size;
      let pendingIndex = 0;

      while (availableSlots > 0 && pendingIndex < pending.length) {
        const file = pending[pendingIndex];
        const key = getFileKey(file);

        if (state.activeIds.has(file.id)) {
          pendingIndex++;
          continue;
        }

        dispatch({ type: 'ADD_ACTIVE_ID', id: file.id });
        dispatch({
          type: 'UPDATE_DOWNLOAD',
          key,
          updates: { phase: DownloadPhase.Downloading },
        });
        dispatchProgress({ type: 'UPDATE_PROGRESS', key, progress: 0 });
        downloadFile(file);
        availableSlots--;
        pendingIndex++;
      }

      if (pending.length === 0 && state.activeIds.size === 0) {
        const completedQueueKeys = new Set(
          currentQueue.map(f => getFileKey(f)),
        );
        completedQueueKeys.forEach(key => {
          dispatchProgress({ type: 'REMOVE_PROGRESS', key });
        });

        let successCount = 0;
        let errorCount = 0;
        const hasActualFailure = currentQueue.some(file => {
          const key = getFileKey(file);
          const download = currentDownloads[key];
          if (download?.isDownloaded === true) {
            successCount++;
            return false;
          }
          if (
            download?.phase === DownloadPhase.Error ||
            download?.error !== undefined
          ) {
            errorCount++;
            return true;
          }
          return false;
        });

        dispatch({ type: 'SET_COMPLETED', completedKeys: completedQueueKeys });
        setFeedback({
          text:
            hasActualFailure || (state.hasFailure && errorCount > 0)
              ? t('common.downloadCompletedWithErrors', {
                  successCount,
                  errorCount,
                })
              : t('common.downloadCompletedShort'),
          isPersistent: false,
        });
        AsyncStorage.removeItem(QUEUE_STORAGE_KEY).catch(() => {});
      } else if (
        pending.length > 0 &&
        state.activeIds.size >= MAX_CONCURRENT_DOWNLOADS &&
        state.isDownloading
      ) {
        if (processQueueTimeoutRef.current) {
          clearTimeout(processQueueTimeoutRef.current);
        }
        processQueueTimeoutRef.current = setTimeout(() => {
          if (state.isDownloading) {
            processQueueRef.current();
          }
        }, 100);
      }
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [state, downloadFile, setFeedback, t, dispatch, dispatchProgress]);

  const processQueueRef = useRef(processQueue);
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  useEffect(() => {
    if (
      state.isDownloading &&
      state.activeIds.size < MAX_CONCURRENT_DOWNLOADS &&
      state.queue.length > 0
    ) {
      processQueueRef.current();
    }

    return () => {
      if (processQueueTimeoutRef.current) {
        clearTimeout(processQueueTimeoutRef.current);
        processQueueTimeoutRef.current = null;
      }
    };
  }, [state.isDownloading, state.activeIds.size, state.queue.length]);

  const startQueueDownload = useCallback(() => {
    if (state.queue.length === 0) return;
    dispatch({ type: 'START_DOWNLOAD' });
    processQueue();
  }, [state.queue.length, processQueue, dispatch]);

  const stopQueueDownload = useCallback(() => {
    state.activeIds.forEach(id => {
      const file = findFileById(state.queue, id);
      if (file) {
        stopActiveDownload(
          file,
          state.downloads,
          dispatch,
          dispatchProgress,
          fsStopDownload,
        );
      }
    });
    dispatch({ type: 'STOP_DOWNLOAD' });
  }, [state, dispatch, dispatchProgress]);

  const stopAndClearAllDownloads = useCallback(() => {
    const current = stateRef.current;
    current.activeIds.forEach(id => {
      const file = findFileById(current.queue, id);
      if (file) {
        stopActiveDownload(
          file,
          current.downloads,
          dispatch,
          dispatchProgress,
          fsStopDownload,
        );
      }
    });
    dispatch({ type: 'STOP_DOWNLOAD' });
    const idsToRemove = current.queue.map(f => f.id);
    if (idsToRemove.length > 0) {
      dispatch({ type: 'REMOVE_FILES', ids: idsToRemove });
    }
  }, [dispatch, dispatchProgress]);

  const addFilesToQueue = useCallback(
    async <T extends DownloadContext>(
      files: Array<{ id: string; name: string; url: string; filePath: string }>,
      contextId: string | number,
      contextType?: T,
    ) => {
      if (state.isDownloading) {
        return;
      }
      const downloadArea = getDownloadAreaFromContextType(contextType);
      const ctxId = String(contextId);
      const filesWithContext: QueuedFile<T>[] = files.map(file => ({
        id: file.id,
        name: file.name,
        request: {
          ctx: downloadArea as T,
          ctxId,
          source: file.url,
          destination: file.filePath,
        },
        contextId: contextId as any,
        contextType: contextType,
      }));

      dispatch({ type: 'ADD_FILES', files: filesWithContext });

      const fileDatabase = getFileDatabase();
      const allFilesInContext = await fileDatabase.getFilesByContext(
        downloadArea,
        ctxId,
      );
      const filesMap = new Map(allFilesInContext.map((f: any) => [f.id, f]));

      Promise.all(
        filesWithContext.map(async file => {
          const key = getFileKey(file);
          const existingDownload = state.downloads[key];
          const fileRecord = filesMap.get(file.id);

          const possiblePaths = [
            fileRecord?.path,
            file.request.destination,
          ].filter(Boolean) as string[];

          const fileExists = await checkPathsExist(possiblePaths);

          if (fileExists) {
            dispatch({
              type: 'UPDATE_DOWNLOAD',
              key,
              updates: {
                ...existingDownload,
                phase: DownloadPhase.Completed,
                isDownloaded: true,
              },
            });
          } else {
            dispatch({
              type: 'UPDATE_DOWNLOAD',
              key,
              updates: {
                ...existingDownload,
                phase: DownloadPhase.Queued,
                isDownloaded: false,
              },
            });
          }
        }),
      ).catch(console.error);
    },
    [state.downloads, state.isDownloading, dispatch],
  );

  const removeFilesFromQueue = useCallback(
    (fileIds: string[]) => {
      fileIds.forEach(id => {
        if (state.activeIds.has(id)) {
          const file = findFileById(state.queue, id);
          if (file) {
            stopActiveDownload(
              file,
              state.downloads,
              dispatch,
              dispatchProgress,
              fsStopDownload,
            );
          }
        }
      });
      dispatch({ type: 'REMOVE_FILES', ids: fileIds });
    },
    [state, dispatch, dispatchProgress],
  );

  const getFilesByContext = useCallback(
    <T extends DownloadContext>(contextId: string | number, contextType?: T) =>
      state.queue.filter(file =>
        matchesContext(file, contextId, contextType as any),
      ) as QueuedFile<T>[],
    [state.queue],
  );

  const clearContextFiles = useCallback(
    <T extends DownloadContext>(
      contextId: string | number,
      contextType?: T,
    ) => {
      const idsToRemove = state.queue
        .filter(file => matchesContext(file, contextId, contextType as any))
        .map(file => file.id);
      if (idsToRemove.length > 0) {
        idsToRemove.forEach(id => {
          if (state.activeIds.has(id)) {
            const file = findFileById(state.queue, id);
            if (file) {
              stopActiveDownload(
                file,
                state.downloads,
                dispatch,
                dispatchProgress,
                fsStopDownload,
              );
            }
          }
        });
        dispatch({ type: 'REMOVE_FILES', ids: idsToRemove });
      }
    },
    [state, dispatch, dispatchProgress],
  );

  return {
    processQueue,
    startQueueDownload,
    stopQueueDownload,
    stopAndClearAllDownloads,
    addFilesToQueue,
    removeFilesFromQueue,
    getFilesByContext,
    clearContextFiles,
  };
};
