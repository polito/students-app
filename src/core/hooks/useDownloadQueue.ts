import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadFile, stopDownload as fsStopDownload } from 'react-native-fs';

import { useApiContext } from '../contexts/ApiContext';
import { useDownloadsContext } from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';

export const useDownloadQueue = () => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const { downloadQueue, setDownloadQueue, downloads, setDownloads } =
    useDownloadsContext();

  const downloadQueueRef = useRef(downloadQueue);
  downloadQueueRef.current = downloadQueue;

  const downloadResultsRef = useRef({ successCount: 0, errorCount: 0 });
  const pendingFeedbackRef = useRef<{
    successCount: number;
    errorCount: number;
  } | null>(null);

  useEffect(() => {
    if (
      pendingFeedbackRef.current &&
      !downloadQueue.isDownloading &&
      downloadQueue.hasCompleted
    ) {
      const { successCount, errorCount } = pendingFeedbackRef.current;

      if (errorCount === 0) {
        setFeedback({
          text: t('courseDirectoryScreen.downloadCompleted'),
          isPersistent: false,
        });
      } else {
        setFeedback({
          text: t('courseDirectoryScreen.downloadCompletedWithErrors', {
            successCount,
            errorCount,
          }),
          isPersistent: false,
        });
      }

      pendingFeedbackRef.current = null;
    }
  }, [downloadQueue.isDownloading, downloadQueue.hasCompleted, setFeedback, t]);

  const downloadNextFile = useCallback(async () => {
    const currentQueue = downloadQueueRef.current;

    if (
      !currentQueue.isDownloading ||
      currentQueue.currentFileIndex >= currentQueue.files.length
    ) {
      setDownloadQueue(prev => ({
        ...prev,
        isDownloading: false,
        currentFileIndex: 0,
        overallProgress: 0,
        hasCompleted: true,
        files: [],
      }));
      return;
    }

    setDownloadQueue(prev => ({
      ...prev,
      isProcessingFile: true,
    }));

    const currentFile = currentQueue.files[currentQueue.currentFileIndex];
    const key = `${currentFile.url}:${currentFile.filePath}`;

    setDownloads(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        downloadProgress: 0,
      },
    }));

    try {
      const { jobId, promise } = downloadFile({
        fromUrl: currentFile.url,
        toFile: currentFile.filePath,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        progressInterval: 200,
        begin: () => {},
        progress: ({ bytesWritten, contentLength }) => {
          const fileProgress = bytesWritten / contentLength;

          setDownloads(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              downloadProgress: fileProgress,
            },
          }));

          setDownloadQueue(prev => {
            const completedFiles = prev.currentFileIndex;
            const overallProgress =
              (completedFiles + fileProgress) / prev.files.length;
            return {
              ...prev,
              overallProgress: Math.min(overallProgress, 1),
            };
          });
        },
      });

      setDownloads(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          jobId,
        },
      }));

      const result = await promise;
      if (result.statusCode !== 200) {
        throw new Error(t('common.downloadError'));
      }

      setDownloads(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          isDownloaded: true,
          downloadProgress: undefined,
        },
      }));

      downloadResultsRef.current.successCount++;

      setDownloadQueue(prev => {
        const newIndex = prev.currentFileIndex + 1;

        if (prev.currentFileIndex >= prev.files.length - 1) {
          pendingFeedbackRef.current = { ...downloadResultsRef.current };

          return {
            ...prev,
            isDownloading: false,
            currentFileIndex: 0,
            overallProgress: 0,
            hasCompleted: true,
            files: [],
            isProcessingFile: false,
          };
        }

        const newState = {
          ...prev,
          currentFileIndex: newIndex,
          overallProgress: newIndex / prev.files.length,
          isProcessingFile: false,
        };

        setTimeout(() => {
          downloadNextFile();
        }, 0);

        return newState;
      });
    } catch (e) {
      setDownloads(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          isDownloaded: false,
          downloadProgress: undefined,
        },
      }));

      downloadResultsRef.current.errorCount++;

      setDownloadQueue(prev => {
        const newIndex = prev.currentFileIndex + 1;

        if (prev.currentFileIndex >= prev.files.length - 1) {
          pendingFeedbackRef.current = { ...downloadResultsRef.current };

          return {
            ...prev,
            isDownloading: false,
            currentFileIndex: 0,
            overallProgress: 0,
            hasCompleted: true,
            files: [],
            isProcessingFile: false,
          };
        }

        const newState = {
          ...prev,
          currentFileIndex: newIndex,
          overallProgress: newIndex / prev.files.length,
          isProcessingFile: false,
        };

        setTimeout(() => {
          downloadNextFile();
        }, 0);

        return newState;
      });
    }
  }, [token, t, setDownloadQueue, setDownloads]);

  const startQueueDownload = useCallback(() => {
    const currentQueue = downloadQueueRef.current;
    if (currentQueue.files.length === 0) return;

    downloadResultsRef.current = { successCount: 0, errorCount: 0 };

    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: true,
      currentFileIndex: 0,
      overallProgress: 0,
    }));

    setTimeout(() => {
      downloadNextFile();
    }, 0);
  }, [setDownloadQueue, downloadNextFile]);

  const stopQueueDownload = useCallback(() => {
    const currentQueue = downloadQueueRef.current;
    const currentFile = currentQueue.files[currentQueue.currentFileIndex];
    if (currentFile) {
      const key = `${currentFile.url}:${currentFile.filePath}`;
      const currentDownload = downloads[key];
      if (currentDownload?.jobId) {
        fsStopDownload(currentDownload.jobId);
      }
    }

    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: false,
    }));
  }, [downloads, setDownloadQueue]);

  return {
    downloadQueue,
    startQueueDownload,
    stopQueueDownload,
  };
};
