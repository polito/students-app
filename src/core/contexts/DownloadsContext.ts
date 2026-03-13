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
  sizeInKiloBytes?: number;
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
  totalToDownloadAtStart: number;
  completedToDownloadCount: number;
}

export type Downloads = Record<string, Download>;

export interface CourseFilePathParams {
  courseId: number | string;
  courseName?: string;
  location?: string;
  fileId: string;
  fileName: string;
  mimeType?: string | null;
}

export interface PickStorageFolderResult {
  uri: string;
  displayPath: string;
}

export const DownloadsContext = createContext<{
  downloads: Downloads;
  downloadQueue: DownloadQueue;
  /** True when any single or queue download is in progress (queued or downloading). Use to disable clean-cache actions. */
  isAnyDownloadInProgress: boolean;
  isRemovalInProgress: boolean;
  setRemovalInProgress: (_value: boolean) => void;
  startQueueDownload: () => void;
  stopQueueDownload: () => void;
  stopAndClearAllDownloads: () => void;
  updateDownload: (_key: string, _updates: Partial<Download>) => void;
  addFilesToQueue<T extends DownloadContext>(
    _files: Array<{
      id: string;
      name: string;
      url: string;
      filePath: string;
      sizeInKiloBytes?: number;
    }>,
    _contextId: AreaIdMap[T],
    _contextType?: T,
    _options?: { startImmediately?: boolean },
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
  getCoursesCachePath: () => string;
  getCourseFolderPath: (
    courseId: number | string,
    courseName?: string,
  ) => string;
  getCourseFilePath: (params: CourseFilePathParams) => string;
  getFileSizeInStorage: (filePath: string) => Promise<number | null>;
  openFile: (filePath: string) => Promise<void>;
  removeFileFromStorage: (filePath: string) => Promise<void>;
  deleteLocalPath: (path: string) => Promise<void>;
  pickStorageFolder: () => Promise<PickStorageFolderResult>;
  fileExistsInStorage: (filePath: string) => Promise<boolean>;
  /** After a download: persist to DB and move to SAF if custom storage is used. Used by useDownloadFile and DownloadsProvider. */
  persistDownloadedFile: (
    localPath: string,
    params: { id: string; ctx: string; ctxId: string },
  ) => Promise<{ checksum: string }>;
  /** Sync local files (documents/Courses) into the DB. Used by AppContent on startup. */
  syncLocalFilesToDb: () => Promise<number>;
  /** Incremented on each file add/remove; use as a dependency to re-run getTotalSize/getTotalSizeByContext. */
  cacheSizeVersion: number;
  /** Call after removing files and updating the DB so file and folder badges refresh from the DB. */
  refreshCacheVersion: () => void;
} | null>(null);

export const useDownloadsContext = () => {
  const downloadsContext = useContext(DownloadsContext);
  if (!downloadsContext)
    throw new Error(
      'No DownloadsContext.Provider found when calling useDownloadsContext.',
    );
  return downloadsContext;
};
