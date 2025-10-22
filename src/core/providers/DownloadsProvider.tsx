import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  downloadFile,
  stopDownload as fsStopDownload,
  mkdir,
} from 'react-native-fs';

import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadQueue,
  Downloads,
  DownloadsContext,
  QueuedFile,
} from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const [downloads, setDownloads] = useState<Downloads>({});
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueue>({
    files: [],
    isDownloading: false,
    currentFileIndex: 0,
    overallProgress: 0,
    hasCompleted: false,
    isProcessingFile: false,
  });

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
          text: t('common.downloadCompleted'),
          isPersistent: false,
        });
      } else {
        setFeedback({
          text: t('common.downloadCompletedWithErrors', {
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
      // Create directory if it doesn't exist
      const directoryPath = currentFile.filePath.substring(
        0,
        currentFile.filePath.lastIndexOf('/'),
      );
      await mkdir(directoryPath, { NSURLIsExcludedFromBackupKey: true });

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

  const addToQueue = useCallback((file: QueuedFile) => {
    setDownloadQueue(prev => ({
      ...prev,
      files: [...prev.files.filter(f => f.id !== file.id), file],
    }));
  }, []);

  const removeFromQueue = useCallback((fileId: string) => {
    setDownloadQueue(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setDownloadQueue({
      files: [],
      isDownloading: false,
      currentFileIndex: 0,
      overallProgress: 0,
      hasCompleted: false,
      isProcessingFile: false,
    });
  }, []);

  const startQueueDownload = useCallback(() => {
    const currentQueue = downloadQueueRef.current;
    if (currentQueue.files.length === 0) return;

    downloadResultsRef.current = { successCount: 0, errorCount: 0 };

    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: true,
      currentFileIndex: 0,
      overallProgress: 0,
      hasCompleted: false,
      isProcessingFile: false,
    }));

    setTimeout(() => {
      downloadNextFile();
    }, 0);
  }, [downloadNextFile]);

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
  }, [downloads]);

  const updateDownload = useCallback(
    (key: string, updates: Partial<Download>) => {
      setDownloads(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...updates,
        },
      }));
    },
    [setDownloads],
  );

  const addFilesToQueue = useCallback(
    (
      files: Omit<QueuedFile, 'contextId' | 'contextType'>[],
      contextId: string | number,
      contextType?: string,
    ) => {
      const filesWithContext = files.map(file => ({
        ...file,
        contextId,
        contextType,
      }));

      setDownloadQueue(prev => ({
        ...prev,
        files: [...prev.files, ...filesWithContext],
      }));
    },
    [setDownloadQueue],
  );

  const removeFilesFromQueue = useCallback(
    (fileIds: string[]) => {
      setDownloadQueue(prev => ({
        ...prev,
        files: prev.files.filter(file => !fileIds.includes(file.id)),
      }));
    },
    [setDownloadQueue],
  );

  const getFilesByContext = useCallback(
    (contextId: string | number, contextType?: string) => {
      return downloadQueue.files.filter(
        file =>
          file.contextId === contextId &&
          (contextType === undefined || file.contextType === contextType),
      );
    },
    [downloadQueue.files],
  );

  const clearContextFiles = useCallback(
    (contextId: string | number, contextType?: string) => {
      setDownloadQueue(prev => ({
        ...prev,
        files: prev.files.filter(
          file =>
            !(
              file.contextId === contextId &&
              (contextType === undefined || file.contextType === contextType)
            ),
        ),
      }));
    },
    [setDownloadQueue],
  );

  return (
    <DownloadsContext.Provider
      value={{
        downloads,
        downloadQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        startQueueDownload,
        stopQueueDownload,
        updateDownload,
        addFilesToQueue,
        removeFilesFromQueue,
        getFilesByContext,
        clearContextFiles,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};
