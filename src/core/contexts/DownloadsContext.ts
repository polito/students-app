import { createContext, useContext } from 'react';

export interface Download {
  jobId?: number;
  isDownloaded: boolean;
  downloadProgress?: number;
}

export interface QueuedFile {
  id: string;
  name: string;
  url: string;
  filePath: string;
  contextId: string | number;
  contextType?: string;
}

export interface DownloadQueue {
  files: QueuedFile[];
  isDownloading: boolean;
  currentFileIndex: number;
  overallProgress: number;
  hasCompleted: boolean;
  isProcessingFile: boolean;
}

export type Downloads = Record<string, Download>;

export const DownloadsContext = createContext<{
  downloads: Downloads;
  downloadQueue: DownloadQueue;
  addToQueue: (_file: QueuedFile) => void;
  removeFromQueue: (_fileId: string) => void;
  clearQueue: () => void;
  startQueueDownload: () => void;
  stopQueueDownload: () => void;
  updateDownload: (_key: string, _updates: Partial<Download>) => void;
  addFilesToQueue: (
    _files: Omit<QueuedFile, 'contextId' | 'contextType'>[],
    _contextId: string | number,
    _contextType?: string,
  ) => void;
  removeFilesFromQueue: (_fileIds: string[]) => void;
  getFilesByContext: (
    _contextId: string | number,
    _contextType?: string,
  ) => QueuedFile[];
  clearContextFiles: (
    _contextId: string | number,
    _contextType?: string,
  ) => void;
} | null>(null);

export const useDownloadsContext = () => {
  const downloadsContext = useContext(DownloadsContext);
  if (!downloadsContext)
    throw new Error(
      'No DownloadsContext.Provider found when calling useDownloadsContext.',
    );
  return downloadsContext;
};
