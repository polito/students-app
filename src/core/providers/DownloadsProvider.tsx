/**
 * DownloadsProvider manages the download queue and file download state.
 * It handles single file downloads, queue processing with concurrency limits,
 * progress tracking, and provides download state to consuming components.
 */
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
import { mkdir, downloadFile as rnDownloadFile, stat } from 'react-native-fs';

import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadContext,
  DownloadPhase,
  DownloadQueue,
  DownloadsContext,
  QueuedFile,
} from '../contexts/DownloadsContext';
import { getFileDatabase } from '../database/FileDatabase';
import { calculateFileChecksum } from './downloads/downloadsChecksum';
import { getFileKey } from './downloads/downloadsFileUtils';
import { useQueueManagement } from './downloads/downloadsQueue';
import {
  initialState,
  progressReducer,
  reducer,
} from './downloads/downloadsState';
import {
  CONTEXT_PROGRESS_UPDATE_THROTTLE_MS,
  PROGRESS_UPDATE_THROTTLE_MS,
} from './downloads/downloadsTypes';

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const fileDatabase = getFileDatabase();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRemovalInProgress, setRemovalInProgress] = useState(false);

  const [progresses, dispatchProgress] = useReducer(progressReducer, {});
  const progressRef = useRef(progresses);
  const lastProgressUpdateRef = useRef<number>(0);
  const [throttledProgresses, setThrottledProgresses] = useState(progresses);
  const lastContextProgressUpdateRef = useRef<number>(0);

  useEffect(() => {
    progressRef.current = progresses;
  }, [progresses]);

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

  const downloadFile = useCallback(
    async (file: QueuedFile<DownloadContext>) => {
      const key = getFileKey(file);
      try {
        await mkdir(
          file.request.destination.substring(
            0,
            file.request.destination.lastIndexOf('/'),
          ),
          { NSURLIsExcludedFromBackupKey: true },
        ).catch(() => {});
        const { jobId, promise } = rnDownloadFile({
          fromUrl: file.request.source,
          toFile: file.request.destination,
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
        try {
          const stats = await stat(file.request.destination);
          const checksum = await calculateFileChecksum(
            file.request.destination,
            stats.size,
          );
          const filename = file.request.destination.split('/').pop() || '';
          await fileDatabase.insertFile({
            id: file.id,
            ctx: file.request.ctx,
            ctxId: file.request.ctxId,
            path: file.request.destination,
            filename,
            mime: filename.split('.').pop() || 'application/octet-stream',
            checksum,
            sizeKb: Math.round(stats.size / 1024),
            downloadTime: new Date().toISOString(),
            updateTime: undefined,
          });
        } catch (metadataError) {
          console.error('Error saving file metadata to SQLite:', metadataError);
        }
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
    [token, t, fileDatabase],
  );

  const {
    startQueueDownload,
    stopQueueDownload,
    stopAndClearAllDownloads,
    addFilesToQueue,
    removeFilesFromQueue,
    getFilesByContext,
    clearContextFiles,
  } = useQueueManagement({
    state,
    dispatch,
    dispatchProgress,
    downloadFile,
  });

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
      } else if ('downloadProgress' in updates) {
        dispatchProgress({ type: 'REMOVE_PROGRESS', key });
      }
    },
    [dispatch, dispatchProgress],
  );

  const downloadQueue = useMemo((): DownloadQueue => {
    const completedFiles = state.queue.filter(
      f =>
        !state.activeIds.has(f.id) &&
        state.downloads[getFileKey(f)]?.isDownloaded === true,
    ).length;
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
    throttledProgresses,
  ]);

  const downloadsWithProgress = useMemo(() => {
    const allKeys = new Set([
      ...Object.keys(state.downloads),
      ...Object.keys(progresses),
    ]);
    return Array.from(allKeys).reduce(
      (acc, key) => {
        const download = state.downloads[key] ?? {};
        const progressValue = throttledProgresses[key] ?? progresses[key];
        const hasProgress = progressValue != null;
        const isDownloaded = download.isDownloaded ?? false;
        const hasJobId = download.jobId !== undefined;
        const shouldShowProgress =
          !isDownloaded &&
          hasProgress &&
          hasJobId &&
          (download.phase === DownloadPhase.Downloading ||
            download.phase === undefined);
        return {
          ...acc,
          [key]: {
            ...download,
            isDownloaded: download.isDownloaded ?? false,
            downloadProgress: shouldShowProgress ? progressValue : undefined,
          },
        };
      },
      {} as Record<string, Download>,
    );
  }, [state.downloads, throttledProgresses, progresses]);

  const contextValue = useMemo(
    () => ({
      downloads: downloadsWithProgress,
      downloadQueue,
      isRemovalInProgress,
      setRemovalInProgress,
      startQueueDownload,
      stopQueueDownload,
      stopAndClearAllDownloads,
      updateDownload,
      addFilesToQueue,
      removeFilesFromQueue,
      getFilesByContext,
      clearContextFiles,
    }),
    [
      downloadsWithProgress,
      downloadQueue,
      isRemovalInProgress,
      startQueueDownload,
      stopQueueDownload,
      stopAndClearAllDownloads,
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
