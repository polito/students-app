/**
 * Queue management for downloads: processes the download queue with concurrency limits,
 * handles queue operations (add/remove files, start/stop downloads), and manages completion logic.
 */
import { Dispatch, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { stopDownload as fsStopDownload } from 'react-native-fs';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_CONCURRENT_DOWNLOADS } from '../../constants';
import { DownloadPhase, QueuedFile } from '../../contexts/DownloadsContext';
import { useFeedbackContext } from '../../contexts/FeedbackContext';
import {
  checkFileExists,
  getFileKey,
  matchesContext,
} from './downloadsFileUtils';
import {
  Action,
  ProgressAction,
  QUEUE_STORAGE_KEY,
  State,
} from './downloadsTypes';

interface UseQueueManagementParams {
  state: State;
  dispatch: Dispatch<Action>;
  dispatchProgress: Dispatch<ProgressAction>;
  downloadSingleFile: (file: QueuedFile) => Promise<void>;
}

export const useQueueManagement = ({
  state,
  dispatch,
  dispatchProgress,
  downloadSingleFile,
}: UseQueueManagementParams) => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const isProcessingQueueRef = useRef(false);
  const processQueueTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        downloadSingleFile(file);
        availableSlots--;
        pendingIndex++;
      }

      if (pending.length === 0 && state.activeIds.size === 0) {
        dispatch({ type: 'SET_COMPLETED' });
        setFeedback({
          text: state.hasFailure
            ? t('common.downloadCompletedWithErrors', {
                successCount: 0,
                errorCount: 0,
              })
            : t('common.downloadCompleted'),
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
  }, [state, downloadSingleFile, setFeedback, t, dispatch, dispatchProgress]);

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
      const file = state.queue.find(f => f.id === id);
      if (file) {
        const download = state.downloads[getFileKey(file)];
        if (download?.jobId !== undefined) fsStopDownload(download.jobId);
      }
    });
    dispatch({ type: 'STOP_DOWNLOAD' });
  }, [state, dispatch]);

  const addFilesToQueue = useCallback(
    async (
      files: Omit<QueuedFile, 'contextId' | 'contextType'>[],
      contextId: string | number,
      contextType?: string,
    ) => {
      const filesWithContext = files.map(file => ({
        ...file,
        contextId,
        contextType,
      }));
      await Promise.all(
        filesWithContext.map(async file => {
          const key = getFileKey(file);
          const existingDownload = state.downloads[key];
          if (await checkFileExists(file)) {
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
      );
      dispatch({ type: 'ADD_FILES', files: filesWithContext });
    },
    [state.downloads, dispatch],
  );

  const removeFilesFromQueue = useCallback(
    (fileIds: string[]) => {
      if (!state.isDownloading)
        dispatch({ type: 'REMOVE_FILES', ids: fileIds });
    },
    [state.isDownloading, dispatch],
  );

  const getFilesByContext = useCallback(
    (contextId: string | number, contextType?: string) =>
      state.queue.filter(file => matchesContext(file, contextId, contextType)),
    [state.queue],
  );

  const clearContextFiles = useCallback(
    (contextId: string | number, contextType?: string) => {
      if (!state.isDownloading) {
        const idsToRemove = state.queue
          .filter(file => matchesContext(file, contextId, contextType))
          .map(file => file.id);
        if (idsToRemove.length > 0)
          dispatch({ type: 'REMOVE_FILES', ids: idsToRemove });
      }
    },
    [state.isDownloading, state.queue, dispatch],
  );

  return {
    processQueue,
    startQueueDownload,
    stopQueueDownload,
    addFilesToQueue,
    removeFilesFromQueue,
    getFilesByContext,
    clearContextFiles,
  };
};
