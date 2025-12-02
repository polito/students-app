import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  downloadFile,
  exists,
  stopDownload as fsStopDownload,
  mkdir,
  readFile,
  stat,
} from 'react-native-fs';

import { sha1 } from '@noble/hashes/legacy.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_CONCURRENT_DOWNLOADS } from '../constants';
import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadPhase,
  DownloadQueue,
  DownloadsContext,
  QueuedFile,
} from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import { getFileDatabase } from '../database/FileDatabase';

interface State {
  downloads: Record<string, Omit<Download, 'downloadProgress'>>;
  queue: QueuedFile[];
  activeIds: Set<string>;
  isDownloading: boolean;
  hasCompleted: boolean;
  hasFailure: boolean;
}

type Action =
  | { type: 'ADD_FILES'; files: QueuedFile[] }
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
  | { type: 'SET_COMPLETED' }
  | { type: 'SET_FAILURE' }
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: State };

type ProgressAction =
  | { type: 'UPDATE_PROGRESS'; key: string; progress: number }
  | { type: 'REMOVE_PROGRESS'; key: string }
  | { type: 'RESET_PROGRESS' };

const QUEUE_STORAGE_KEY = '@downloads_queue';
const FILE_SIZE_LIMIT_MB = 100;
const PROGRESS_UPDATE_THROTTLE_MS = 200;
// Throttle for context value updates - only update context when progress changes significantly
const CONTEXT_PROGRESS_UPDATE_THROTTLE_MS = 500;

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const fileDatabase = getFileDatabase();

  const initialState: State = {
    downloads: {},
    queue: [],
    activeIds: new Set(),
    isDownloading: false,
    hasCompleted: false,
    hasFailure: false,
  };

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case 'ADD_FILES':
        return {
          ...state,
          queue: [
            ...state.queue.filter(
              f => !action.files.some(nf => nf.id === f.id),
            ),
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

  const [state, dispatch] = useReducer(reducer, initialState);

  const progressReducer = (
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
      case 'RESET_PROGRESS':
        return {};
      default:
        return progressState;
    }
  };

  const [progresses, dispatchProgress] = useReducer(progressReducer, {});
  const progressRef = useRef(progresses);
  const lastProgressUpdateRef = useRef<number>(0);
  const [throttledProgresses, setThrottledProgresses] = useState(progresses);
  const lastContextProgressUpdateRef = useRef<number>(0);

  useEffect(() => {
    progressRef.current = progresses;
  }, [progresses]);

  // Throttle progress updates for context value to reduce consumer re-renders
  useEffect(() => {
    const now = Date.now();
    if (
      now - lastContextProgressUpdateRef.current >=
      CONTEXT_PROGRESS_UPDATE_THROTTLE_MS
    ) {
      setThrottledProgresses(progresses);
      lastContextProgressUpdateRef.current = now;
    }
  }, [progresses]);

  const getFileKey = useCallback(
    (file: QueuedFile) => `${file.url}:${file.filePath}`,
    [],
  );

  const calculateFileChecksum = useCallback(
    async (filePath: string, expectedSize?: number): Promise<string> => {
      try {
        if (!(await exists(filePath))) throw new Error('File does not exist');
        const fileStats = await stat(filePath);
        if (fileStats.size === 0) throw new Error('File is empty');
        if (expectedSize && fileStats.size !== expectedSize)
          throw new Error('File size mismatch');
        if (fileStats.size > FILE_SIZE_LIMIT_MB * 1024 * 1024) {
          console.warn(
            `Skipping checksum for large file (${Math.round(fileStats.size / 1024 / 1024)}MB)`,
          );
          return 'checksum_skipped_large_file';
        }
        const fileContent = await readFile(filePath, 'base64');
        if (!fileContent || fileContent.length === 0)
          throw new Error('File content is empty');
        const binaryString = atob(fileContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++)
          bytes[i] = binaryString.charCodeAt(i);
        const hash = sha1(bytes);
        return Array.from(hash)
          .map((b: unknown) => (b as number).toString(16).padStart(2, '0'))
          .join('');
      } catch {
        return 'checksum_error';
      }
    },
    [],
  );

  // Memoize downloadQueue with specific dependencies to avoid recalculation on every progress update
  // Use throttled progresses for overallProgress calculation to reduce re-renders
  // Internal progress tracking uses real-time progresses via progressRef
  const downloadQueue = useMemo((): DownloadQueue => {
    const completedFiles = state.queue.filter(
      f =>
        !state.activeIds.has(f.id) &&
        state.downloads[getFileKey(f)]?.isDownloaded === true,
    ).length;
    // Use throttled progresses for context, but real-time for internal calculations
    const activeProgresses = state.queue
      .filter(f => state.activeIds.has(f.id))
      .map(f => throttledProgresses[getFileKey(f)] ?? 0);
    const activeCount = activeProgresses.length;
    const activeProgressSum = activeProgresses.reduce((sum, p) => sum + p, 0);
    const totalFiles = state.queue.length;
    const overallProgress =
      totalFiles > 0
        ? activeCount > 0
          ? (completedFiles + activeProgressSum / activeCount) / totalFiles
          : completedFiles / totalFiles
        : 0;
    return {
      files: state.queue,
      isDownloading: state.isDownloading,
      currentFileIndex: completedFiles,
      activeDownloadIds: state.activeIds,
      overallProgress: Math.min(overallProgress, 1),
      hasCompleted: state.hasCompleted,
      isProcessingFile: state.activeIds.size > 0,
      hasFailure: state.hasFailure,
    };
  }, [
    state.queue,
    state.activeIds,
    state.isDownloading,
    state.hasCompleted,
    state.hasFailure,
    state.downloads,
    getFileKey,
    throttledProgresses,
  ]);

  const matchesContext = useCallback(
    (
      file: QueuedFile,
      contextId: string | number,
      contextType?: string,
    ): boolean =>
      String(file.contextId) === String(contextId) &&
      (contextType === undefined || file.contextType === contextType),
    [],
  );

  useEffect(() => {
    AsyncStorage.setItem(
      QUEUE_STORAGE_KEY,
      JSON.stringify({ ...state, activeIds: Array.from(state.activeIds) }),
    ).catch(console.error);
  }, [state]);

  useEffect(() => {
    const loadQueue = async () => {
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
  }, []);

  const downloadSingleFile = useCallback(
    async (file: QueuedFile) => {
      const key = getFileKey(file);
      try {
        await mkdir(
          file.filePath.substring(0, file.filePath.lastIndexOf('/')),
          { NSURLIsExcludedFromBackupKey: true },
        ).catch(() => {});
        const { jobId, promise } = downloadFile({
          fromUrl: file.url,
          toFile: file.filePath,
          headers: { Authorization: `Bearer ${token}` },
          progress: ({ bytesWritten, contentLength }) => {
            const fileProgress = bytesWritten / contentLength;
            const now = Date.now();
            progressRef.current[key] = fileProgress;
            if (
              now - lastProgressUpdateRef.current >=
              PROGRESS_UPDATE_THROTTLE_MS
            ) {
              dispatchProgress({
                type: 'UPDATE_PROGRESS',
                key,
                progress: fileProgress,
              });
              lastProgressUpdateRef.current = now;
            }
          },
        });
        dispatch({ type: 'UPDATE_DOWNLOAD', key, updates: { jobId } });
        const result = await promise;
        if (result.statusCode !== 200)
          throw new Error(t('common.downloadError'));
        dispatch({
          type: 'UPDATE_DOWNLOAD',
          key,
          updates: {
            phase: DownloadPhase.Completed,
            isDownloaded: true,
            error: undefined,
          },
        });
        dispatchProgress({ type: 'REMOVE_PROGRESS', key });
        const stats = await stat(file.filePath);
        const checksum = await calculateFileChecksum(file.filePath, stats.size);
        const filename = file.filePath.split('/').pop() || '';
        await fileDatabase.insertFile({
          id: file.id,
          area: `course-${file.contextId}`,
          path: file.filePath,
          filename,
          mime: filename.split('.').pop() || 'application/octet-stream',
          checksum,
          sizeKb: Math.round(stats.size / 1024),
          downloadTime: new Date().toISOString(),
          updateTime: undefined,
        });
      } catch (error) {
        dispatch({
          type: 'UPDATE_DOWNLOAD',
          key,
          updates: {
            phase: DownloadPhase.Error,
            isDownloaded: false,
            error: String(error),
          },
        });
        dispatchProgress({ type: 'REMOVE_PROGRESS', key });
        dispatch({ type: 'SET_FAILURE' });
      } finally {
        dispatch({ type: 'REMOVE_ACTIVE_ID', id: file.id });
      }
    },
    [token, t, getFileKey, calculateFileChecksum, fileDatabase],
  );

  const isProcessingQueueRef = useRef(false);
  const processQueueTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processQueue = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isProcessingQueueRef.current) return;
    if (!state.isDownloading) return;

    isProcessingQueueRef.current = true;

    try {
      const pending = state.queue.filter(
        f =>
          !state.activeIds.has(f.id) &&
          !state.downloads[getFileKey(f)]?.isDownloaded,
      );
      const slots = MAX_CONCURRENT_DOWNLOADS - state.activeIds.size;
      const toStart = pending.slice(0, slots);

      toStart.forEach(file => {
        const key = getFileKey(file);
        dispatch({ type: 'ADD_ACTIVE_ID', id: file.id });
        dispatch({
          type: 'UPDATE_DOWNLOAD',
          key,
          updates: { phase: DownloadPhase.Downloading },
        });
        dispatchProgress({ type: 'UPDATE_PROGRESS', key, progress: 0 });
        downloadSingleFile(file);
      });

      // Check completion
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
        state.activeIds.size >= MAX_CONCURRENT_DOWNLOADS
      ) {
        // More files to process but no slots available - schedule retry
        if (processQueueTimeoutRef.current) {
          clearTimeout(processQueueTimeoutRef.current);
        }
        processQueueTimeoutRef.current = setTimeout(() => {
          processQueueRef.current();
        }, 100);
      }
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [state, getFileKey, downloadSingleFile, setFeedback, t]);

  // Store processQueue in ref to avoid dependency issues
  const processQueueRef = useRef(processQueue);
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // Auto-process queue when conditions change, but use ref to avoid dependency on processQueue
  useEffect(() => {
    if (
      state.isDownloading &&
      state.activeIds.size < MAX_CONCURRENT_DOWNLOADS &&
      state.queue.length > 0
    ) {
      // Use ref to avoid recreating processQueue on every state change
      processQueueRef.current();
    }

    // Cleanup timeout on unmount or when download stops
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
  }, [state.queue.length, processQueue]);

  const stopQueueDownload = useCallback(() => {
    state.activeIds.forEach(id => {
      const file = state.queue.find(f => f.id === id);
      if (file) {
        const download = state.downloads[getFileKey(file)];
        if (download?.jobId !== undefined) fsStopDownload(download.jobId);
      }
    });
    dispatch({ type: 'STOP_DOWNLOAD' });
  }, [state, getFileKey]);

  const updateDownload = useCallback(
    (key: string, updates: Partial<Download>) => {
      const { downloadProgress, ...rest } = updates;
      dispatch({ type: 'UPDATE_DOWNLOAD', key, updates: rest });
      if (downloadProgress !== undefined) {
        dispatchProgress({
          type: 'UPDATE_PROGRESS',
          key,
          progress: downloadProgress,
        });
      }
    },
    [],
  );

  const checkFileExists = useCallback(
    async (file: QueuedFile): Promise<boolean> => {
      try {
        const fileRecord = await fileDatabase.getFileById(file.id);
        if (fileRecord)
          return (
            (await exists(fileRecord.path)) || (await exists(file.filePath))
          );
        return await exists(file.filePath);
      } catch {
        return false;
      }
    },
    [fileDatabase],
  );

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
    [getFileKey, state.downloads, checkFileExists],
  );

  const removeFilesFromQueue = useCallback(
    (fileIds: string[]) => {
      if (!state.isDownloading)
        dispatch({ type: 'REMOVE_FILES', ids: fileIds });
    },
    [state.isDownloading],
  );

  const getFilesByContext = useCallback(
    (contextId: string | number, contextType?: string) =>
      state.queue.filter(file => matchesContext(file, contextId, contextType)),
    [state.queue, matchesContext],
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
    [state.isDownloading, state.queue, matchesContext],
  );

  // Use throttled progresses for context value to reduce re-renders
  // Internal calculations use real-time progresses via progressRef
  const downloadsWithProgress = useMemo(
    () =>
      Object.keys(state.downloads).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...state.downloads[key],
            downloadProgress: throttledProgresses[key],
          },
        }),
        {} as Record<string, Download>,
      ),
    [state.downloads, throttledProgresses],
  );

  // Memoize context value to prevent unnecessary re-renders of all consumers
  // Only re-render consumers when actual values change, not on every progress update
  const contextValue = useMemo(
    () => ({
      downloads: downloadsWithProgress,
      downloadQueue,
      startQueueDownload,
      stopQueueDownload,
      updateDownload,
      addFilesToQueue,
      removeFilesFromQueue,
      getFilesByContext,
      clearContextFiles,
    }),
    [
      downloadsWithProgress,
      downloadQueue,
      startQueueDownload,
      stopQueueDownload,
      updateDownload,
      addFilesToQueue,
      removeFilesFromQueue,
      getFilesByContext,
      clearContextFiles,
    ],
  );

  return (
    <DownloadsContext.Provider value={contextValue}>
      {children}
    </DownloadsContext.Provider>
  );
};
