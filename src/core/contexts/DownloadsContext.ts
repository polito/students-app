import { createContext, useContext } from 'react';

export enum DownloadPhase {
  Queued = 'queued',
  Downloading = 'downloading',
  Completed = 'completed',
  Error = 'error',
}

export enum DownloadContext {
  Course = 'course',
}

export type AreaIdMap = {
  [DownloadContext.Course]: number;
};

export interface DownloadRequest<T extends DownloadContext> {
  ctx: T;
  ctxId: string;
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

export interface QueuedFile<T extends DownloadContext> {
  id: string;
  name: string;
  request: DownloadRequest<T>;
  contextId: AreaIdMap[T];
  contextType?: T;
}

export interface DownloadQueue {
  files: QueuedFile<DownloadContext>[];
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
  addFilesToQueue<T extends DownloadContext>(
    _files: Array<{ id: string; name: string; url: string; filePath: string }>,
    _contextId: AreaIdMap[T],
    _contextType?: T,
  ): void | Promise<void>;
  removeFilesFromQueue: (_fileIds: string[]) => void;
  getFilesByContext<T extends DownloadContext>(
    _contextId: AreaIdMap[T],
    _contextType?: T,
  ): QueuedFile<T>[];
  clearContextFiles<T extends DownloadContext>(
    _contextId: AreaIdMap[T],
    _contextType?: T,
  ): void;
} | null>(null);

export const useDownloadsContext = () => {
  const downloadsContext = useContext(DownloadsContext);
  if (!downloadsContext)
    throw new Error(
      'No DownloadsContext.Provider found when calling useDownloadsContext.',
    );
  return downloadsContext;
};
