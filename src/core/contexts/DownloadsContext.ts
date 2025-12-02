import { createContext, useContext } from 'react';

export enum DownloadPhase {
  Queued = 'queued',
  Downloading = 'downloading',
  Completed = 'completed',
  Error = 'error',
}

export enum DownloadArea {
  Course = 'course',
}

export interface DownloadRequest<T extends DownloadArea = DownloadArea> {
  area: T;
  id: string;
  source: string;
  destination: string;
}

export interface Download {
  jobId?: number;
  isDownloaded: boolean;
  downloadProgress?: number;
  phase?: DownloadPhase;
  error?: string;
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
  activeDownloadIds: Set<string>;
  overallProgress: number;
  hasCompleted: boolean;
  isProcessingFile: boolean;
  hasFailure: boolean;
}

export type Downloads = Record<string, Download>;

export const DownloadsContext = createContext<{
  downloads: Downloads;
  downloadQueue: DownloadQueue;
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
