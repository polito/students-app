import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { open } from 'react-native-file-viewer';
import {
  downloadFile,
  exists,
  stopDownload as fsStopDownload,
  mkdir,
  moveFile,
  stat,
  unlink,
} from 'react-native-fs';
import { dirname } from 'react-native-path';

import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadPhase,
  useDownloadsContext,
} from '../contexts/DownloadsContext';
import { FileRecord, getFileDatabase } from '../database/FileDatabase';
import { calculateFileChecksum } from '../providers/downloads/downloadsChecksum';
import { useNotifications } from './useNotifications';

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
  const { clearNotificationScope } = useNotifications();

  const fileDatabase = getFileDatabase();
  const currentJobIdRef = useRef<number | undefined>(undefined);
  const isStoppedRef = useRef<boolean>(false);

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
            const fileExistsOnDisk = await exists(toFile);
            if (fileExistsOnDisk) {
              const currentFilename = toFile.split('/').pop() || '';
              if (fileRecord.filename !== currentFilename) {
                try {
                  const oldPath = fileRecord.path;

                  if (oldPath !== toFile && (await exists(oldPath))) {
                    await moveFile(oldPath, toFile);
                  }

                  await fileDatabase.updateFile(fileId, {
                    filename: currentFilename,
                    path: toFile,
                    updateTime: new Date().toISOString(),
                  });
                } catch (updateError) {
                  console.error('Error updating file metadata:', updateError);
                }
              }
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
        }
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
          await mkdir(dirname(toFile));

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
            const fileExists = await exists(toFile);
            if (!fileExists) {
              console.warn(
                'File does not exist, skipping SQLite metadata save:',
                toFile,
              );
              return false;
            }

            const fileStats = await stat(toFile);
            const filename = toFile.split('/').pop() || '';
            const mimeType =
              filename.split('.').pop() || 'application/octet-stream';

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
    await unlink(toFile);
    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
    return startDownload(true);
  }, [download.isDownloaded, startDownload, toFile, updateDownload]);

  const removeDownload = useCallback(async () => {
    await unlink(toFile);

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
  }, [toFile, updateDownload, fileId, deleteFileFromSQLite]);

  const openFile = useCallback(async () => {
    open(toFile).catch(async (e: Error) => {
      if (e.message === 'No app associated with this mime type') {
        Alert.alert(t('common.error'), `Cannot open file: ${e.message}`, [
          { text: t('common.ok') },
        ]);
      }
    });
    clearNotificationScope(['files', fileId]);
  }, [toFile, clearNotificationScope, fileId, t]);

  return {
    ...(download ?? {}),
    startDownload,
    stopDownload,
    refreshDownload,
    removeDownload,
    openFile,
  };
};
