import { Dispatch, SetStateAction, createContext, useContext } from 'react';

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
  courseId: number;
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
  setDownloads: Dispatch<SetStateAction<Downloads>>;
  downloadQueue: DownloadQueue;
  setDownloadQueue: Dispatch<SetStateAction<DownloadQueue>>;
  addToQueue: (_file: QueuedFile) => void;
  removeFromQueue: (_fileId: string) => void;
  clearQueue: () => void;
  startQueueDownload: () => void;
  stopQueueDownload: () => void;
} | null>(null);

export const useDownloadsContext = () => {
  const downloadsContext = useContext(DownloadsContext);
  if (!downloadsContext)
    throw new Error(
      'No DownloadsContext.Provider found when calling useDownloadsContext.',
    );
  return downloadsContext;
};
