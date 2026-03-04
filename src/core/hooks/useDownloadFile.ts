import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { open } from 'react-native-file-viewer';
import {
  downloadFile,
  exists,
  stopDownload as fsStopDownload,
  stat,
} from 'react-native-fs';
import { lookup } from 'react-native-mime-types';
import { dirname } from 'react-native-path';

import { mkdirRecursive } from '../../utils/files';
import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadPhase,
  useDownloadsContext,
} from '../contexts/DownloadsContext';
import { FileRecord, getFileDatabase } from '../database/FileDatabase';
import { calculateFileChecksum } from '../providers/downloads/downloadsChecksum';
import {
  fileExistsSafAware,
  getCustomStoragePrefs,
  getUriForOpening,
  moveToSafAfterDownload,
  removeFileSafAware,
} from '../providers/downloads/safMirror';

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
  const { downloads, updateDownload: updateDownloadFromContext } =
    useDownloadsContext();
  // const { clearNotificationScope } = useNotifications();

  const fileDatabase = getFileDatabase();
  const currentJobIdRef = useRef<number | undefined>(undefined);
  const isStoppedRef = useRef<boolean>(false);
  const [isCheckingDownloadStatus, setIsCheckingDownloadStatus] =
    useState(true);

  const insertFileToSQLite = useCallback(
    async (file: FileRecord) => {
      await fileDatabase.insertFile(file);
    },
    [fileDatabase],
  );

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
    (async () => {
      if (toFile) {
        try {
          const fileRecord = await checkFileExistsInSQLite(fileId);
          if (fileRecord) {
            const prefs = await getCustomStoragePrefs();
            const fileOnDisk = prefs
              ? await fileExistsSafAware(toFile)
              : await exists(toFile).catch(() => false);
            if (fileOnDisk) {
              updateDownload({ isDownloaded: true });
            } else {
              updateDownload({ isDownloaded: false });
            }
          } else {
            updateDownload({ isDownloaded: false });
          }
        } catch (error) {
          console.error('Error checking file status:', error);
          updateDownload({ isDownloaded: false });
        } finally {
          setIsCheckingDownloadStatus(false);
        }
      } else {
        setIsCheckingDownloadStatus(false);
      }
    })();
  }, [toFile, fileId, checkFileExistsInSQLite, updateDownload, fileDatabase]);

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

          const { jobId, promise } = downloadFile({
            fromUrl,
            toFile,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            progressInterval: 200,
            begin: () => {},
            progress: ({ bytesWritten, contentLength }) => {
              if (!isStoppedRef.current && currentJobIdRef.current === jobId) {
                updateDownload({
                  downloadProgress: bytesWritten / contentLength,
                });
              }
            },
          });
          currentJobIdRef.current = jobId;
          updateDownload({ jobId });

          if (isStoppedRef.current) {
            return false;
          }

          const result = await promise;

          if (isStoppedRef.current) {
            return false;
          }
          if (result.statusCode !== 200) {
            throw new Error(t('common.downloadError'));
          }
          if (isStoppedRef.current) {
            return false;
          }

          currentJobIdRef.current = undefined;
          updateDownload({
            isDownloaded: true,
            downloadProgress: undefined,
            phase: DownloadPhase.Completed,
          });

          try {
            const fileStats = await stat(toFile);
            const filename = toFile.split('/').pop() || '';
            const ext = filename.split('.').pop() || '';
            const mimeType = lookup(ext) || 'application/octet-stream';

            let checksum = 'checksum_error';
            try {
              checksum = await calculateFileChecksum(toFile);

              if (apiChecksum && checksum !== apiChecksum) {
                Alert.alert(
                  t('common.warning'),
                  t('courseScreen.fileIntegrityCheckFailed'),
                  [{ text: t('common.ok') }],
                );
              }
            } catch (checksumError) {
              console.warn(
                'Could not calculate checksum, using placeholder:',
                checksumError,
              );
            }
            await insertFileToSQLite({
              id: fileId,
              ctx,
              ctxId,
              path: toFile,
              filename,
              mime: mimeType,
              checksum,
              sizeKb: Math.round(fileStats.size / 1024),
              downloadTime: new Date().toISOString(),
              updateTime: undefined,
            });

            try {
              const safPath = await moveToSafAfterDownload(toFile, mimeType);
              if (safPath) {
                await fileDatabase.updateFile(fileId, { path: safPath });
              }
            } catch (e) {
              console.error('SAF move after download failed:', e);
            }

            return true;
          } catch (error) {
            console.error('Error saving file metadata to SQLite:', error);
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
      insertFileToSQLite,
      apiChecksum,
      fileDatabase,
    ],
  );

  const stopDownload = useCallback(() => {
    const jobId = currentJobIdRef.current ?? download.jobId;
    if (jobId) {
      isStoppedRef.current = true;
      currentJobIdRef.current = undefined;
      updateDownload({
        jobId: undefined,
        isDownloaded: false,
        downloadProgress: undefined,
        phase: undefined,
      });
      fsStopDownload(jobId);
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
    await removeFileSafAware(pathToRemove);
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
  ]);

  const removeDownload = useCallback(async () => {
    const fileRecord = await fileDatabase.getFileById(fileId);
    const pathToRemove = fileRecord?.path ?? toFile;
    await removeFileSafAware(pathToRemove);

    try {
      await deleteFileFromSQLite(fileId);
    } catch (error) {
      console.error('Error removing file metadata from SQLite:', error);
    }

    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
  }, [toFile, updateDownload, fileId, deleteFileFromSQLite, fileDatabase]);

  const openFile = useCallback(async () => {
    try {
      const uri = await getUriForOpening(toFile);
      await open(uri);
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
    //clearNotificationScope(['files', fileId]);
  }, [toFile, t]);

  return {
    ...(download ?? {}),
    isCheckingDownloadStatus,
    startDownload,
    stopDownload,
    refreshDownload,
    removeDownload,
    openFile,
  };
};
