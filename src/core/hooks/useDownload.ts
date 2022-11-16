import { useContext, useEffect } from 'react';
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

  useEffect(() => {
    if (toFile) {
      exists(toFile).then(result => {
        updateDownload({ isDownloaded: result });
      });
    }
  }, [toFile]);

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
        await promise;
        updateDownload({
          isDownloaded: true,
          downloadProgress: null,
        });
      } catch (e) {
        // TODO show error message
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
  };
};
