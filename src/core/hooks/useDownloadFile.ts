import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { dirname, mkdirRecursive } from '../../utils/files';
import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadPhase,
  useDownloadsContext,
} from '../contexts/DownloadsContext';
import { FileRecord, getFileDatabase } from '../database/FileDatabase';
import {
  type DownloadProgressData,
  createResumableDownload,
} from '../storage/fileSystem';

// import { useNotifications } from './useNotifications';

export const useDownloadFile = (
  fromUrl: string,
  toFile: string,
  fileId: string,
  ctx: string,
  ctxId: string,
  apiChecksum?: string,
) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const {
    downloads,
    updateDownload: updateDownloadFromContext,
    fileExistsInStorage,
    openFile: openFileFromContext,
    removeFileFromStorage,
    persistDownloadedFile,
    cacheSizeVersion,
    refreshCacheVersion,
  } = useDownloadsContext();
  // const { clearNotificationScope } = useNotifications();

  const fileDatabase = getFileDatabase();
  const currentJobIdRef = useRef<number | undefined>(undefined);
  const isStoppedRef = useRef<boolean>(false);
  const [isCheckingDownloadStatus, setIsCheckingDownloadStatus] =
    useState(true);
  const [isOutdated, setIsOutdated] = useState(false);

  const deleteFileFromSQLite = useCallback(
    async (id: string) => {
      await fileDatabase.deleteFile(id);
    },
    [fileDatabase],
  );

  const checkFileExistsInSQLite = useCallback(
    async (id: string): Promise<FileRecord | null> => {
      return await fileDatabase.getFileById(id);
    },
    [fileDatabase],
  );
  const key = `${fromUrl}:${toFile}`;
  const download = useMemo(
    () =>
      downloads[key] ?? {
        isDownloaded: false,
        downloadProgress: undefined,
      },
    [downloads, key],
  );

  const updateDownload = useCallback(
    (updates: Partial<Download>) => {
      updateDownloadFromContext(key, updates);
    },
    [key, updateDownloadFromContext],
  );

  useEffect(() => {
    if (!toFile) {
      setIsCheckingDownloadStatus(false);
      return;
    }
    if (download.isDownloaded) {
      setIsCheckingDownloadStatus(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const fileRecord = await checkFileExistsInSQLite(fileId);
        if (cancelled) return;
        if (fileRecord) {
          const fileOnDisk = await fileExistsInStorage(toFile);
          if (cancelled) return;
          if (fileOnDisk) {
            const outdated =
              !!apiChecksum &&
              !!fileRecord.checksum &&
              apiChecksum !== fileRecord.checksum;
            setIsOutdated(outdated);
            updateDownload({ isDownloaded: true });
          } else {
            setIsOutdated(false);
            updateDownload({ isDownloaded: false });
          }
        } else {
          setIsOutdated(false);
          updateDownload({ isDownloaded: false });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error checking file status:', error);
          updateDownload({ isDownloaded: false });
        }
      } finally {
        if (!cancelled) setIsCheckingDownloadStatus(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    toFile,
    fileId,
    download.isDownloaded,
    checkFileExistsInSQLite,
    updateDownload,
    fileExistsInStorage,
    cacheSizeVersion,
    apiChecksum,
  ]);

  const resumableRef = useRef<ReturnType<
    typeof createResumableDownload
  > | null>(null);

  const startDownload = useCallback(
    async (force = false): Promise<boolean> => {
      if (
        force ||
        (!download.isDownloaded && download.downloadProgress == null)
      ) {
        isStoppedRef.current = false;
        updateDownload({
          downloadProgress: 0,
          phase: DownloadPhase.Downloading,
        });
        try {
          await mkdirRecursive(dirname(toFile));

          const jobId = 1;
          const resumable = createResumableDownload(
            fromUrl,
            toFile,
            { headers: { Authorization: `Bearer ${token}` } },
            ({
              totalBytesWritten,
              totalBytesExpectedToWrite,
            }: DownloadProgressData) => {
              if (
                !isStoppedRef.current &&
                currentJobIdRef.current === jobId &&
                totalBytesExpectedToWrite > 0
              ) {
                updateDownload({
                  downloadProgress:
                    totalBytesWritten / totalBytesExpectedToWrite,
                });
              }
            },
          );
          resumableRef.current = resumable;
          currentJobIdRef.current = jobId;
          updateDownload({ jobId });

          if (isStoppedRef.current) {
            return false;
          }

          const result = await resumable.downloadAsync();
          resumableRef.current = null;

          if (isStoppedRef.current) {
            return false;
          }
          if (result == null || result.status !== 200) {
            throw new Error(t('common.downloadError'));
          }
          if (isStoppedRef.current) {
            return false;
          }

          currentJobIdRef.current = undefined;

          try {
            const { checksum } = await persistDownloadedFile(toFile, {
              id: fileId,
              ctx,
              ctxId,
            });
            if (apiChecksum && checksum !== apiChecksum) {
              Alert.alert(
                t('common.warning'),
                t('courseScreen.fileIntegrityCheckFailed'),
                [{ text: t('common.ok') }],
              );
            }
            updateDownload({
              isDownloaded: true,
              downloadProgress: undefined,
              phase: DownloadPhase.Completed,
            });
            return true;
          } catch (error) {
            console.error('Error saving file metadata to SQLite:', error);
            updateDownload({
              isDownloaded: false,
              downloadProgress: undefined,
              phase: DownloadPhase.Error,
            });
            return false;
          }
        } catch (e) {
          const isAborted = (e as Error).message?.includes('aborted');
          if (isStoppedRef.current || isAborted) {
            currentJobIdRef.current = undefined;
            isStoppedRef.current = false;
            return false;
          }

          console.error('Error downloading file:', e);
          Alert.alert(t('common.error'), t('courseScreen.fileDownloadFailed'));
          currentJobIdRef.current = undefined;
          isStoppedRef.current = false;
          updateDownload({
            jobId: undefined,
            isDownloaded: false,
            downloadProgress: undefined,
            phase: undefined,
          });
          return false;
        }
      }
      return download.isDownloaded;
    },
    [
      download,
      fromUrl,
      t,
      toFile,
      token,
      updateDownload,
      ctx,
      ctxId,
      fileId,
      apiChecksum,
      persistDownloadedFile,
    ],
  );

  const stopDownload = useCallback(() => {
    const jobId = currentJobIdRef.current ?? download.jobId;
    if (jobId && resumableRef.current) {
      isStoppedRef.current = true;
      currentJobIdRef.current = undefined;
      resumableRef.current.cancelAsync();
      resumableRef.current = null;
      updateDownload({
        jobId: undefined,
        isDownloaded: false,
        downloadProgress: undefined,
        phase: undefined,
      });
    } else if (download.downloadProgress != null) {
      isStoppedRef.current = true;
      currentJobIdRef.current = undefined;
      updateDownload({
        jobId: undefined,
        isDownloaded: false,
        downloadProgress: undefined,
        phase: undefined,
      });
    }
  }, [download.jobId, download.downloadProgress, updateDownload]);

  const refreshDownload = useCallback(async () => {
    if (!download.isDownloaded) {
      return startDownload();
    }
    const fileRecord = await fileDatabase.getFileById(fileId);
    const pathToRemove = fileRecord?.path ?? toFile;
    await removeFileFromStorage(pathToRemove);
    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
    return startDownload(true);
  }, [
    download.isDownloaded,
    startDownload,
    toFile,
    updateDownload,
    fileId,
    fileDatabase,
    removeFileFromStorage,
  ]);

  const removeDownload = useCallback(async () => {
    const fileRecord = await fileDatabase.getFileById(fileId);
    const pathToRemove = fileRecord?.path ?? toFile;
    await removeFileFromStorage(pathToRemove);

    try {
      await deleteFileFromSQLite(fileId);
    } catch (error) {
      console.error('Error removing file metadata from SQLite:', error);
    }

    refreshCacheVersion();
    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
  }, [
    toFile,
    updateDownload,
    fileId,
    deleteFileFromSQLite,
    fileDatabase,
    removeFileFromStorage,
    refreshCacheVersion,
  ]);

  const openFile = useCallback(async () => {
    try {
      await openFileFromContext(toFile);
    } catch (e: any) {
      if (e?.message === 'No app associated with this mime type') {
        Alert.alert(t('common.error'), `Cannot open file: ${e.message}`, [
          { text: t('common.ok') },
        ]);
      } else {
        Alert.alert(t('common.error'), t('courseScreen.fileNotFound'), [
          { text: t('common.ok') },
        ]);
      }
    }
  }, [toFile, t, openFileFromContext]);

  return {
    ...(download ?? {}),
    isCheckingDownloadStatus,
    isOutdated,
    startDownload,
    stopDownload,
    refreshDownload,
    removeDownload,
    openFile,
  };
};
