import { PropsWithChildren, useCallback, useState } from 'react';

import {
  DownloadQueue,
  Downloads,
  DownloadsContext,
  QueuedFile,
} from '../contexts/DownloadsContext';

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const [downloads, setDownloads] = useState<Downloads>({});
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueue>({
    files: [],
    isDownloading: false,
    currentFileIndex: 0,
    overallProgress: 0,
    hasCompleted: false,
    isProcessingFile: false,
  });

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
    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: true,
      currentFileIndex: 0,
      overallProgress: 0,
      hasCompleted: false,
      isProcessingFile: false,
    }));
  }, []);

  const stopQueueDownload = useCallback(() => {
    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: false,
    }));
  }, []);

  return (
    <DownloadsContext.Provider
      value={{
        downloads,
        setDownloads,
        downloadQueue,
        setDownloadQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        startQueueDownload,
        stopQueueDownload,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};
