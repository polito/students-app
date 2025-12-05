import { useCallback } from 'react';

import { useDownloadsContext } from '../contexts/DownloadsContext';

export const useDownloadQueue = () => {
  const { downloadQueue, startQueueDownload, stopQueueDownload } =
    useDownloadsContext();

  return {
    downloadQueue,
    startQueueDownload,
    stopQueueDownload,
  };
};

export const useGenericDownload = (
  contextId: string | number,
  contextType?: string,
) => {
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

  const contextFiles = getFilesByContext(contextId, contextType);
  const isDownloading = downloadQueue.isDownloading && contextFiles.length > 0;
  const hasFiles = contextFiles.length > 0;

  const addFiles = useCallback(
    (
      files: Array<{ id: string; name: string; url: string; filePath: string }>,
    ) => {
      addFilesToQueue(files, contextId, contextType);
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
    clearContextFiles(contextId, contextType);
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

  return {
    downloads,
    downloadQueue,
    contextFiles,
    isDownloading,
    hasFiles,
    addFiles,
    removeFiles,
    clearFiles,
    startDownload,
    stopDownload,
  };
};
