import { useCallback, useMemo } from 'react';

import {
  AreaIdMap,
  DownloadContext,
  DownloadQueue,
  QueuedFile,
  useDownloadsContext,
} from '../contexts/DownloadsContext';

export function useDownloadQueue<T extends DownloadContext>(
  contextId?: AreaIdMap[T],
  contextType?: T,
): {
  downloads: Record<string, import('../contexts/DownloadsContext').Download>;
  downloadQueue: DownloadQueue;
  startQueueDownload: () => void;
  stopQueueDownload: () => void;
  contextFiles: QueuedFile<T>[];
  isDownloading: boolean;
  hasFiles: boolean;
  addFiles: (
    files: Array<{
      id: string;
      name: string;
      url: string;
      filePath: string;
    }>,
  ) => void;
  removeFiles: (fileIds: string[]) => void;
  clearFiles: () => void;
  startDownload: () => void;
  stopDownload: () => void;
} {
  const {
    downloads,
    downloadQueue,
    addFilesToQueue,
    removeFilesFromQueue,
    getFilesByContext,
    clearContextFiles,
    startQueueDownload,
    stopQueueDownload,
  } = useDownloadsContext();

  const contextFiles = useMemo(() => {
    if (contextId !== undefined && contextType !== undefined) {
      return getFilesByContext(contextId, contextType);
    }
    return [];
  }, [contextId, contextType, getFilesByContext]);

  const isDownloading = useMemo(
    () => downloadQueue.isDownloading && contextFiles.length > 0,
    [downloadQueue.isDownloading, contextFiles.length],
  );

  const hasFiles = useMemo(
    () => contextFiles.length > 0,
    [contextFiles.length],
  );

  const addFiles = useCallback(
    (
      files: Array<{ id: string; name: string; url: string; filePath: string }>,
    ) => {
      if (contextId !== undefined && contextType !== undefined) {
        addFilesToQueue(files, contextId, contextType);
      }
    },
    [addFilesToQueue, contextId, contextType],
  );

  const removeFiles = useCallback(
    (fileIds: string[]) => {
      removeFilesFromQueue(fileIds);
    },
    [removeFilesFromQueue],
  );

  const clearFiles = useCallback(() => {
    if (contextId !== undefined && contextType !== undefined) {
      clearContextFiles(contextId, contextType);
    }
  }, [clearContextFiles, contextId, contextType]);

  const startDownload = useCallback(() => {
    if (hasFiles) {
      startQueueDownload();
    }
  }, [hasFiles, startQueueDownload]);

  const stopDownload = useCallback(() => {
    if (isDownloading) {
      stopQueueDownload();
      clearFiles();
    }
  }, [isDownloading, stopQueueDownload, clearFiles]);

  if (contextId === undefined || contextType === undefined) {
    return {
      downloads,
      downloadQueue,
      startQueueDownload,
      stopQueueDownload,
      contextFiles: [] as QueuedFile<T>[],
      isDownloading: downloadQueue.isDownloading,
      hasFiles: false,
      addFiles: () => {},
      removeFiles: removeFilesFromQueue,
      clearFiles: () => {},
      startDownload: startQueueDownload,
      stopDownload: stopQueueDownload,
    };
  }

  return {
    downloads,
    downloadQueue,
    startQueueDownload,
    stopQueueDownload,
    contextFiles,
    isDownloading,
    hasFiles,
    addFiles,
    removeFiles,
    clearFiles,
    startDownload,
    stopDownload,
  };
}
