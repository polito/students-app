//
// noinspection AllyPlainJsInspection
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { open } from 'react-native-file-viewer';
import {
  downloadFile,
  stopDownload as fsStopDownload,
  mkdir,
  moveFile,
  unlink,
} from 'react-native-fs';
import { dirname } from 'react-native-path';

import { CourseFilesCacheContext } from '../../features/courses/contexts/CourseFilesCacheContext';
import { UnsupportedFileTypeError } from '../../features/courses/errors/UnsupportedFileTypeError';
import { useCoursesFilesCachePath } from '../../features/courses/hooks/useCourseFilesCachePath';
import { cleanupEmptyFolders } from '../../utils/files';
import { useApiContext } from '../contexts/ApiContext';
import { Download, useDownloadsContext } from '../contexts/DownloadsContext';

export const useDownloadCourseFile = (
  fromUrl: string,
  toFile: string,
  fileId: string,
) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const coursesFilesCachePath = useCoursesFilesCachePath();
  const { downloadsRef, setDownloads } = useDownloadsContext();
  const {
    cache,
    isRefreshing: isCacheRefreshing,
    refresh,
  } = useContext(CourseFilesCacheContext);
  const key = `${fromUrl}:${toFile}`;
  const download = useMemo(
    () =>
      downloadsRef.current?.[key] ?? {
        isDownloaded: false,
        downloadProgress: undefined,
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [downloadsRef.current?.[key], key],
  );

  const updateDownload = useCallback(
    (updates: Partial<Download>) => {
      setDownloads(oldDownloads => ({
        ...oldDownloads,
        [key]: {
          ...oldDownloads[key],
          ...updates,
        },
      }));
    },
    [key, setDownloads],
  );

  const cachedFilePath = cache[fileId];

  useEffect(() => {
    (async () => {
      if (toFile && !isCacheRefreshing) {
        if (cachedFilePath) {
          if (cachedFilePath === toFile) {
            updateDownload({ isDownloaded: true });
          } else {
            // Update the name when changed
            try {
              await mkdir(dirname(toFile));
              await moveFile(cachedFilePath, toFile);
              await cleanupEmptyFolders(coursesFilesCachePath);
              refresh();
            } catch (_) {
              // File rename was already scheduled
            }
          }
        } else {
          updateDownload({ isDownloaded: false });
        }
      }
    })();
  }, [
    cachedFilePath,
    coursesFilesCachePath,
    fileId,
    isCacheRefreshing,
    refresh,
    toFile,
    updateDownload,
  ]);

  const startDownload = useCallback(
    async (force = false) => {
      if (
        force ||
        (!download.isDownloaded && download.downloadProgress == null)
      ) {
        updateDownload({ downloadProgress: 0 });
        try {
          await mkdir(dirname(toFile));

          const { jobId, promise } = downloadFile({
            fromUrl,
            toFile,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            progressInterval: 200,
            begin: () => {
              /* Needed for progress updates to work */
            },
            progress: ({ bytesWritten, contentLength }) => {
              updateDownload({
                downloadProgress: bytesWritten / contentLength,
              });
            },
          });
          updateDownload({ jobId });
          const result = await promise;
          if (result.statusCode !== 200) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(t('common.downloadError'));
          }
          updateDownload({
            isDownloaded: true,
            downloadProgress: undefined,
          });
        } catch (e) {
          if (!(e as Error).message?.includes('aborted')) {
            Alert.alert(
              t('common.error'),
              t('courseScreen.fileDownloadFailed'),
            );
          }
          updateDownload({
            isDownloaded: false,
            downloadProgress: undefined,
          });
        }
      }
    },
    [download, fromUrl, t, toFile, token, updateDownload],
  );

  const stopDownload = useCallback(() => {
    const jobId = download.jobId;
    if (jobId) {
      fsStopDownload(jobId);
      updateDownload({
        isDownloaded: false,
        downloadProgress: undefined,
      });
    }
  }, [download.jobId, updateDownload]);

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
    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
  }, [toFile, updateDownload]);

  const openFile = useCallback(
    () =>
      open(toFile).catch(async (e: Error) => {
        if (e.message === 'No app associated with this mime type') {
          throw new UnsupportedFileTypeError(`Cannot open file ${fromUrl}`);
        }
      }),
    [fromUrl, toFile],
  );

  return {
    ...(download ?? {}),
    startDownload,
    stopDownload,
    refreshDownload,
    removeDownload,
    openFile,
  };
};
