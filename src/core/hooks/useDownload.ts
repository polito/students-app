import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  downloadFile,
  exists,
  mkdir,
  stopDownload,
  unlink,
} from 'react-native-fs';
import { dirname } from 'react-native-path';

import { Download, DownloadsContext } from '../contexts/DownloadsContext';

export const useDownload = (fromUrl: string, toFile: string) => {
  const { t } = useTranslation();
  const { downloadsRef, setDownloads } = useContext(DownloadsContext);
  const key = `${fromUrl}:${toFile}`;
  let download = downloadsRef.current[key];

  useEffect(() => {
    if (!download) {
      download = {
        isDownloaded: false,
        downloadProgress: null,
      };
      setDownloads(oldDownloads => ({
        ...oldDownloads,
        [key]: download,
      }));
    }
  }, []);

  const updateDownload = (updates: Partial<Download>) => {
    setDownloads(oldDownloads => ({
      ...oldDownloads,
      [key]: {
        ...oldDownloads[key],
        ...updates,
      },
    }));
  };

  const notifyFileSystemChange = () => {
    if (toFile) {
      exists(toFile).then(result => {
        updateDownload({ isDownloaded: result });
      });
    }
  };

  useEffect(notifyFileSystemChange, [toFile]);

  const start = async () => {
    download = downloadsRef.current[key];
    if (!download.isDownloaded && download.downloadProgress == null) {
      updateDownload({ downloadProgress: 0 });
      try {
        await mkdir(dirname(toFile), {
          NSURLIsExcludedFromBackupKey: true,
        });
        const { jobId, promise } = downloadFile({
          fromUrl,
          toFile,
          progressInterval: 200,
          begin: () => {
            /* Needed for progress updates to work */
          },
          progress: ({ bytesWritten, contentLength }) => {
            updateDownload({ downloadProgress: bytesWritten / contentLength });
          },
        });
        updateDownload({ jobId });
        const result = await promise;
        if (result.statusCode !== 200) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(t('courseFileListItem.downloadError'));
        }
        updateDownload({
          isDownloaded: true,
          downloadProgress: null,
        });
      } catch (e) {
        // TODO show error message
        updateDownload({
          isDownloaded: false,
          downloadProgress: null,
        });
        throw e;
      }
    }
  };

  const stop = () => {
    download = downloadsRef.current[key];
    const jobId = download?.jobId;
    if (jobId) {
      stopDownload(jobId);
      updateDownload({
        isDownloaded: false,
        downloadProgress: null,
      });
      // TODO feedback
    }
  };

  const refresh = async () => {
    download = downloadsRef.current[key];
    if (!download.isDownloaded) {
      return start();
    }
    await unlink(toFile);
    updateDownload({
      jobId: null,
      isDownloaded: false,
      downloadProgress: null,
    });
    return start();
  };

  const remove = async () => {
    await unlink(toFile);
    updateDownload({
      jobId: null,
      isDownloaded: false,
      downloadProgress: null,
    });
  };

  return {
    ...download,
    start,
    stop,
    refresh,
    remove,
    notifyFileSystemChange,
  };
};
