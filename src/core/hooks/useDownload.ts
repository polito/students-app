//
// noinspection AllyPlainJsInspection
import { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { open } from 'react-native-file-viewer';
import {
  downloadFile,
  stopDownload as fsStopDownload,
  mkdir,
  unlink,
} from 'react-native-fs';
import { dirname } from 'react-native-path';

import { FilesCacheContext } from '../../features/teaching/contexts/FilesCacheContext';
import { UnsupportedFileTypeError } from '../../features/teaching/errors/UnsupportedFileTypeError';
import { useApiContext } from '../contexts/ApiContext';
import { Download, useDownloadsContext } from '../contexts/DownloadsContext';

export const useDownload = (fromUrl: string, toFile: string) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const { downloadsRef, setDownloads } = useDownloadsContext();
  const { cache } = useContext(FilesCacheContext);
  const key = `${fromUrl}:${toFile}`;

  let download: Download = useMemo(() => {
    if (downloadsRef.current && key in downloadsRef.current) {
      return downloadsRef.current[key];
    } else {
      download = {
        isDownloaded: false,
        downloadProgress: undefined,
      };
      setDownloads(oldDownloads => ({
        ...oldDownloads,
        [key]: download,
      }));

      return download;
    }
  }, [downloadsRef, key, setDownloads]);

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
      updateDownload({ isDownloaded: cache[toFile] === true });
    }
  }, [toFile, cache]);

  const startDownload = async () => {
    if (!download.isDownloaded && download.downloadProgress == null) {
      updateDownload({ downloadProgress: 0 });
      try {
        await mkdir(dirname(toFile), {
          NSURLIsExcludedFromBackupKey: true,
        });
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
            updateDownload({ downloadProgress: bytesWritten / contentLength });
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
        Alert.alert(t('common.error'), t('courseScreen.fileDownloadFailed'));
        updateDownload({
          isDownloaded: false,
          downloadProgress: undefined,
        });
        throw e;
      }
    }
  };

  const stopDownload = () => {
    const jobId = download?.jobId;
    if (jobId) {
      fsStopDownload(jobId);
      updateDownload({
        isDownloaded: false,
        downloadProgress: undefined,
      });
    }
  };

  const refreshDownload = async () => {
    if (!download.isDownloaded) {
      return startDownload();
    }
    await unlink(toFile);
    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
    return startDownload();
  };

  const removeDownload = async () => {
    await unlink(toFile);
    updateDownload({
      jobId: undefined,
      isDownloaded: false,
      downloadProgress: undefined,
    });
  };

  const openFile = () => {
    return open(toFile).catch(async e => {
      if (e.message === 'No app associated with this mime type') {
        throw new UnsupportedFileTypeError(`Cannot open file ${fromUrl}`);
      }
    });
  };

  return {
    ...download,
    startDownload,
    stopDownload,
    refreshDownload,
    removeDownload,
    openFile,
  };
};
