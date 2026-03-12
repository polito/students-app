/**
 * Download queue: types, state, reducers, file utils, and useQueueManagement.
 * Single module for queue types, state management, and queue operations.
 */
import { Dispatch, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_CONCURRENT_DOWNLOADS } from '../../constants';
import {
  Download,
  DownloadContext,
  DownloadPhase,
  QueuedFile,
} from '../../contexts/DownloadsContext';
import { useFeedbackContext } from '../../contexts/FeedbackContext';
import { getFileDatabase } from '../../database/FileDatabase';
import { deleteAsync, pathExists } from '../../storage/fileSystem';

// --- Types & constants ---

export const QUEUE_STORAGE_KEY = '@downloads_queue';
export const PROGRESS_UPDATE_THROTTLE_MS = 200;
export const CONTEXT_PROGRESS_UPDATE_THROTTLE_MS = 500;

export interface State {
  downloads: Record<string, Omit<Download, 'downloadProgress'>>;
  queue: QueuedFile<DownloadContext>[];
  activeIds: Set<string>;
  isDownloading: boolean;
  hasCompleted: boolean;
  hasFailure: boolean;
  alreadyDownloadedKeysAtStart: Set<string>;
}

export type Action =
  | { type: 'ADD_FILES'; files: QueuedFile<DownloadContext>[] }
  | { type: 'REMOVE_FILES'; ids: string[] }
  | {
      type: 'UPDATE_DOWNLOAD';
      key: string;
      updates: Partial<Omit<Download, 'downloadProgress'>>;
    }
  | { type: 'START_DOWNLOAD' }
  | { type: 'STOP_DOWNLOAD' }
  | { type: 'ADD_ACTIVE_ID'; id: string }
  | { type: 'REMOVE_ACTIVE_ID'; id: string }
  | { type: 'SET_COMPLETED'; completedKeys?: Set<string> }
  | { type: 'SET_FAILURE' }
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: State };

export type ProgressAction =
  | { type: 'UPDATE_PROGRESS'; key: string; progress: number }
  | { type: 'REMOVE_PROGRESS'; key: string };

// --- State & reducers ---

export const initialState: State = {
  downloads: {},
  queue: [],
  activeIds: new Set(),
  isDownloading: false,
  hasCompleted: false,
  hasFailure: false,
  alreadyDownloadedKeysAtStart: new Set(),
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
    case 'REMOVE_FILES': {
      const removedFiles = state.queue.filter(f => action.ids.includes(f.id));
      const keysToRemove = new Set(removedFiles.map(f => getFileKey(f)));
      const newDownloads = { ...state.downloads };
      keysToRemove.forEach(k => {
        delete newDownloads[k];
      });
      return {
        ...state,
        queue: state.queue.filter(f => !action.ids.includes(f.id)),
        downloads: newDownloads,
      };
    }
    case 'UPDATE_DOWNLOAD':
      return {
        ...state,
        downloads: {
          ...state.downloads,
          [action.key]: { ...state.downloads[action.key], ...action.updates },
        },
      };
    case 'START_DOWNLOAD': {
      const keyOf = (f: (typeof state.queue)[0]) =>
        `${f.request.source}:${f.request.destination}`;
      const alreadyDownloadedKeysAtStart = new Set(
        state.queue
          .filter(f => state.downloads[keyOf(f)]?.isDownloaded === true)
          .map(keyOf),
      );
      return {
        ...state,
        isDownloading: true,
        activeIds: new Set(),
        hasCompleted: false,
        hasFailure: false,
        alreadyDownloadedKeysAtStart,
      };
    }
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
        alreadyDownloadedKeysAtStart: new Set(),
      };
    case 'SET_FAILURE':
      return { ...state, hasFailure: true };
    case 'RESET':
      return initialState;
    case 'RESTORE':
      return {
        ...action.state,
        alreadyDownloadedKeysAtStart:
          action.state.alreadyDownloadedKeysAtStart ?? new Set(),
      };
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

// --- File utils ---

export const getFileKey = (file: QueuedFile<DownloadContext>): string =>
  `${file.request.source}:${file.request.destination}`;

export const checkPathsExist = async (paths: string[]): Promise<boolean> => {
  for (const path of paths) {
    if (await pathExists(path)) return true;
  }
  return false;
};

export const checkFileExists = async (
  file: QueuedFile<DownloadContext>,
): Promise<boolean> => {
  try {
    const fileDatabase = getFileDatabase();
    const fileRecord = await fileDatabase.getFileById(file.id);
    const possiblePaths = [fileRecord?.path, file.request.destination].filter(
      Boolean,
    ) as string[];
    return await checkPathsExist(possiblePaths);
  } catch {
    return false;
  }
};

export const matchesContext = (
  file: QueuedFile<DownloadContext>,
  contextId: string | number,
  contextType?: string,
): boolean =>
  String(file.request.ctxId) === String(contextId) &&
  (contextType === undefined || file.contextType === contextType);

export const findFileById = (
  queue: QueuedFile<DownloadContext>[],
  id: string,
): QueuedFile<DownloadContext> | undefined => queue.find(f => f.id === id);

export const stopActiveDownload = (
  file: QueuedFile<DownloadContext>,
  downloads: Record<string, Omit<Download, 'downloadProgress'>>,
  dispatch: Dispatch<Action>,
  dispatchProgress: Dispatch<ProgressAction>,
  fsStopDownload: (jobId: number) => void | Promise<void>,
): void => {
  const key = getFileKey(file);
  const download = downloads[key];
  if (download?.jobId !== undefined) {
    Promise.resolve(fsStopDownload(download.jobId)).catch(() => {});
  }
  deleteAsync(file.request.destination).catch(() => {});
  dispatch({ type: 'REMOVE_ACTIVE_ID', id: file.id });
  dispatchProgress({ type: 'REMOVE_PROGRESS', key });
};

// --- Queue hook ---

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
  stopDownload: (jobId: number) => void | Promise<void>;
}

export const useQueueManagement = ({
  state,
  dispatch,
  dispatchProgress,
  downloadFile,
  stopDownload: fsStopDownload,
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

        const alreadyDownloadedAtStart =
          state.alreadyDownloadedKeysAtStart ?? new Set<string>();
        let successCount = 0;
        let errorCount = 0;
        const hasActualFailure = currentQueue.some(file => {
          const key = getFileKey(file);
          const download = currentDownloads[key];
          if (download?.isDownloaded === true) {
            if (!alreadyDownloadedAtStart.has(key)) {
              successCount++;
            }
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
  }, [state, dispatch, dispatchProgress, fsStopDownload]);

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
  }, [dispatch, dispatchProgress, fsStopDownload]);

  const addFilesToQueue = useCallback(
    async <T extends DownloadContext>(
      files: Array<{
        id: string;
        name: string;
        url: string;
        filePath: string;
        sizeInKiloBytes?: number;
      }>,
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
        sizeInKiloBytes: file.sizeInKiloBytes,
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

          if (fileExists && fileRecord) {
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
    [state, dispatch, dispatchProgress, fsStopDownload],
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
    [state, dispatch, dispatchProgress, fsStopDownload],
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
