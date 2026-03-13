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
import { open } from 'react-native-file-viewer';

import { dirname, mkdirRecursive } from '../../utils/files';
import { buildCourseFilePath, stripIdInParentheses } from '../../utils/files';
import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadContext,
  DownloadPhase,
  DownloadQueue,
  DownloadsContext,
  QueuedFile,
} from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import {
  type DownloadProgressData,
  createResumableDownload,
} from '../storage/fileSystem';
import { deleteAsync } from '../storage/fileSystem';
import { pickSafDirectory } from '../storage/saf';
import {
  deleteLocalPath as deleteLocalPathStorage,
  ensureFileLocal,
  fileExistsInStorage as fileExistsInStorageImpl,
  getCoursesRootPath,
  getCoursesStagingPath,
  getFileSizeInStorage as getFileSizeInStorageImpl,
  persistDownloadedFileToDb,
  removeFileFromStorage as removeFileFromStorageImpl,
  syncLocalFilesToDb as syncLocalFilesToDbImpl,
} from '../storage/storageLocation';
import {
  CONTEXT_PROGRESS_UPDATE_THROTTLE_MS,
  PROGRESS_UPDATE_THROTTLE_MS,
  getFileKey,
  initialState,
  progressReducer,
  reducer,
  useQueueManagement,
} from './downloads/downloadsQueue';

const activeDownloadResumables = new Map<
  number,
  ReturnType<typeof createResumableDownload>
>();
let downloadIdCounter = 0;

const DOWNLOAD_SNACKBAR_ID = 'download-progress';
const REMOVE_SNACKBAR_ID = 'remove-progress';
const LARGE_FILE_SIZE_KB = 20 * 1024;
const LARGE_FILES_MESSAGE_DELAY_MS = 4000;

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const { token, username } = useApiContext();
  const preferences = usePreferencesContext();
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const setFeedbackRef = useRef(setFeedback);
  setFeedbackRef.current = setFeedback;

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isRemovalInProgress, setRemovalInProgress] = useState(false);
  const [cacheSizeVersion, setCacheSizeVersion] = useState(0);

  const [progresses, dispatchProgress] = useReducer(progressReducer, {});
  const progressRef = useRef(progresses);
  const lastProgressUpdateRef = useRef<number>(0);
  const [throttledProgresses, setThrottledProgresses] = useState(progresses);
  const lastContextProgressUpdateRef = useRef<number>(0);

  const [largeFilesMessageVisible, setLargeFilesMessageVisible] =
    useState(false);
  const downloadSnackbarShownRef = useRef(false);
  const removeSnackbarShownRef = useRef(false);
  const largeFilesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
      const dest = file.request.destination;
      try {
        await mkdirRecursive(dirname(dest), {
          NSURLIsExcludedFromBackupKey: true,
        });

        const jobId = ++downloadIdCounter;
        const resumable = createResumableDownload(
          file.request.source,
          dest,
          { headers: { Authorization: `Bearer ${token}` } },
          ({
            totalBytesWritten,
            totalBytesExpectedToWrite,
          }: DownloadProgressData) => {
            const fileProgress =
              totalBytesExpectedToWrite > 0
                ? totalBytesWritten / totalBytesExpectedToWrite
                : 0;
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
        );
        activeDownloadResumables.set(jobId, resumable);

        dispatch({ type: 'UPDATE_DOWNLOAD', key, updates: { jobId } });
        const result = await resumable.downloadAsync();
        activeDownloadResumables.delete(jobId);

        if (result == null) throw new Error(t('common.downloadError'));
        if (result.status !== 200) throw new Error(t('common.downloadError'));
        dispatchProgress({ type: 'UPDATE_PROGRESS', key, progress: 1 });
        try {
          await persistDownloadedFileToDb(dest, {
            id: file.id,
            ctx: file.request.ctx,
            ctxId: file.request.ctxId,
          });
          setCacheSizeVersion(v => v + 1);
          dispatchProgress({ type: 'REMOVE_PROGRESS', key });
          dispatch({
            type: 'UPDATE_DOWNLOAD',
            key,
            updates: {
              phase: DownloadPhase.Completed,
              isDownloaded: true,
              error: undefined,
            },
          });
        } catch (metadataError) {
          console.error('Error saving file metadata to SQLite:', metadataError);
          dispatchProgress({ type: 'REMOVE_PROGRESS', key });
          dispatch({
            type: 'UPDATE_DOWNLOAD',
            key,
            updates: {
              phase: DownloadPhase.Error,
              isDownloaded: false,
              error: String(metadataError),
            },
          });
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
        deleteAsync(dest).catch(() => {});
      } finally {
        dispatch({ type: 'REMOVE_ACTIVE_ID', id: file.id });
      }
    },
    [token, t],
  );

  const stopDownload = useCallback((jobId: number) => {
    const resumable = activeDownloadResumables.get(jobId);
    if (resumable) resumable.cancelAsync().catch(() => {});
    activeDownloadResumables.delete(jobId);
  }, []);

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
    stopDownload,
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

  const useCustomStorage = preferences.fileStorageLocation === 'custom';
  const coursesCachePath = useMemo(
    () =>
      useCustomStorage
        ? getCoursesStagingPath(username ?? '')
        : getCoursesRootPath(username ?? ''),
    [username, useCustomStorage],
  );

  const getCoursesCachePath = useCallback(
    () => coursesCachePath,
    [coursesCachePath],
  );

  const getCourseFolderPath = useCallback(
    (courseId: number | string, courseName?: string) => {
      const folderName = courseName
        ? stripIdInParentheses(`${courseName} (${courseId})`)
        : String(courseId);
      return [coursesCachePath, folderName].filter(Boolean).join('/');
    },
    [coursesCachePath],
  );

  const getCourseFilePath = useCallback(
    (params: {
      courseId: number | string;
      courseName?: string;
      location?: string;
      fileId: string;
      fileName: string;
      mimeType?: string | null;
    }) => {
      const folderPath = getCourseFolderPath(
        params.courseId,
        params.courseName,
      );
      return buildCourseFilePath(
        folderPath,
        params.location,
        params.fileId,
        params.fileName,
        params.mimeType,
      );
    },
    [getCourseFolderPath],
  );

  const getFileSizeInStorage = useCallback(
    (filePath: string) => getFileSizeInStorageImpl(filePath),
    [],
  );

  const openFile = useCallback(async (filePath: string) => {
    const localPath = await ensureFileLocal(filePath);
    await open(localPath);
  }, []);

  const removeFileFromStorage = useCallback(async (filePath: string) => {
    await removeFileFromStorageImpl(filePath);
  }, []);

  const refreshCacheVersion = useCallback(() => {
    setCacheSizeVersion(v => v + 1);
  }, []);

  const deleteLocalPath = useCallback(
    (path: string) => deleteLocalPathStorage(path),
    [],
  );

  const pickStorageFolder = useCallback(() => pickSafDirectory(), []);

  const fileExistsInStorage = useCallback(
    (filePath: string) => fileExistsInStorageImpl(filePath),
    [],
  );

  const persistDownloadedFile = useCallback(
    async (
      localPath: string,
      params: { id: string; ctx: string; ctxId: string },
    ) => {
      const result = await persistDownloadedFileToDb(localPath, params);
      setCacheSizeVersion(v => v + 1);
      return result;
    },
    [],
  );

  const syncLocalFilesToDb = useCallback(
    () =>
      syncLocalFilesToDbImpl(username ?? '', preferences.fileStorageLocation),
    [username, preferences.fileStorageLocation],
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
    const totalToDownloadAtStart = state.isDownloading
      ? state.downloadRunTotal
      : 0;
    const completedToDownloadCount = state.isDownloading
      ? state.downloadRunCompletedCount
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
      totalToDownloadAtStart,
      completedToDownloadCount,
    };
  }, [
    state.queue,
    state.activeIds,
    state.isDownloading,
    state.hasCompleted,
    state.hasFailure,
    state.downloads,
    state.downloadRunTotal,
    state.downloadRunCompletedCount,
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

  const isDownloadingSnackbar =
    downloadQueue.isDownloading && downloadQueue.files.length > 0;
  const totalCount = downloadQueue.totalToDownloadAtStart || 0;
  const completedToDownloadCount = downloadQueue.completedToDownloadCount || 0;
  const currentIndex =
    totalCount > 0 ? Math.min(completedToDownloadCount + 1, totalCount) : 1;
  const hasLargeFilesInQueue = downloadQueue.files
    .filter(f => !downloadsWithProgress[getFileKey(f)]?.isDownloaded)
    .some(f => (f.sizeInKiloBytes ?? 0) > LARGE_FILE_SIZE_KB);

  useEffect(() => {
    if (!isDownloadingSnackbar && downloadSnackbarShownRef.current) {
      downloadSnackbarShownRef.current = false;
      setLargeFilesMessageVisible(false);
      setFeedbackRef.current({
        text: t('common.downloadCompletedShort'),
        isPersistent: false,
      });
    }
  }, [isDownloadingSnackbar, t]);

  useEffect(() => {
    if (!isDownloadingSnackbar) {
      setLargeFilesMessageVisible(false);
      if (largeFilesTimeoutRef.current) {
        clearTimeout(largeFilesTimeoutRef.current);
        largeFilesTimeoutRef.current = null;
      }
      return;
    }
    if (largeFilesTimeoutRef.current) return;
    largeFilesTimeoutRef.current = setTimeout(() => {
      largeFilesTimeoutRef.current = null;
      setLargeFilesMessageVisible(true);
    }, LARGE_FILES_MESSAGE_DELAY_MS);
    return () => {
      if (largeFilesTimeoutRef.current) {
        clearTimeout(largeFilesTimeoutRef.current);
        largeFilesTimeoutRef.current = null;
      }
    };
  }, [isDownloadingSnackbar]);

  useEffect(() => {
    if (!isDownloadingSnackbar || totalCount <= 0) return;
    downloadSnackbarShownRef.current = true;
    const progressText = t('common.downloadInProgressCount', {
      current: currentIndex,
      total: totalCount,
    });
    const largeFilesHint =
      largeFilesMessageVisible && hasLargeFilesInQueue
        ? `\n${t('common.downloadLargeFilesPleaseWait')}`
        : '';
    setFeedbackRef.current({
      id: DOWNLOAD_SNACKBAR_ID,
      text: progressText + largeFilesHint,
      isPersistent: true,
      action: {
        label: t('common.stop'),
        onPress: () => {
          stopAndClearAllDownloads();
          setFeedbackRef.current(null);
          downloadSnackbarShownRef.current = false;
          setLargeFilesMessageVisible(false);
        },
      },
    });
  }, [
    isDownloadingSnackbar,
    totalCount,
    currentIndex,
    largeFilesMessageVisible,
    hasLargeFilesInQueue,
    t,
    stopAndClearAllDownloads,
  ]);

  useEffect(() => {
    if (isRemovalInProgress && !removeSnackbarShownRef.current) {
      removeSnackbarShownRef.current = true;
      setFeedbackRef.current({
        id: REMOVE_SNACKBAR_ID,
        text: t('common.removeInProgress'),
        isPersistent: true,
      });
    }
  }, [isRemovalInProgress, t]);

  useEffect(() => {
    if (!isRemovalInProgress && removeSnackbarShownRef.current) {
      removeSnackbarShownRef.current = false;
      setFeedbackRef.current({
        text: t('common.removeCompletedShort'),
        isPersistent: false,
      });
    }
  }, [isRemovalInProgress, t]);

  const contextValue = useMemo(
    () => ({
      downloads: downloadsWithProgress,
      downloadQueue,
      isAnyDownloadInProgress:
        downloadQueue.isDownloading ||
        downloadQueue.isProcessingFile ||
        Object.values(downloadsWithProgress).some(
          d =>
            d.phase === DownloadPhase.Downloading ||
            d.phase === DownloadPhase.Queued,
        ),
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
      getCoursesCachePath,
      getCourseFolderPath,
      getCourseFilePath,
      getFileSizeInStorage,
      openFile,
      removeFileFromStorage,
      deleteLocalPath,
      pickStorageFolder,
      fileExistsInStorage,
      persistDownloadedFile,
      syncLocalFilesToDb,
      cacheSizeVersion,
      refreshCacheVersion,
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
      getCoursesCachePath,
      getCourseFolderPath,
      getCourseFilePath,
      getFileSizeInStorage,
      openFile,
      removeFileFromStorage,
      deleteLocalPath,
      pickStorageFolder,
      fileExistsInStorage,
      persistDownloadedFile,
      syncLocalFilesToDb,
      cacheSizeVersion,
      refreshCacheVersion,
    ],
  );

  return (
    <DownloadsContext.Provider value={contextValue}>
      {children}
    </DownloadsContext.Provider>
  );
};
