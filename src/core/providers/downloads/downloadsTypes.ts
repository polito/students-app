/**
 * Types and constants for downloads: defines State, Action, and ProgressAction types,
 * along with configuration constants like throttle intervals.
 */
import {
  Download,
  DownloadContext,
  QueuedFile,
} from '../../contexts/DownloadsContext';

export const QUEUE_STORAGE_KEY = '@downloads_queue';
export const PROGRESS_UPDATE_THROTTLE_MS = 200;
export const CONTEXT_PROGRESS_UPDATE_THROTTLE_MS = 500;

export interface State {
  downloads: Record<string, Omit<Download, 'downloadProgress'>>;
  queue: QueuedFile<DownloadContext>[];
  activeIds: Set<string>;
  isDownloading: boolean;
  hasCompleted: boolean;
  hasFailure: boolean;
  alreadyDownloadedKeysAtStart: Set<string>;
}

export type Action =
  | { type: 'ADD_FILES'; files: QueuedFile<DownloadContext>[] }
  | { type: 'REMOVE_FILES'; ids: string[] }
  | {
      type: 'UPDATE_DOWNLOAD';
      key: string;
      updates: Partial<Omit<Download, 'downloadProgress'>>;
    }
  | { type: 'START_DOWNLOAD' }
  | { type: 'STOP_DOWNLOAD' }
  | { type: 'ADD_ACTIVE_ID'; id: string }
  | { type: 'REMOVE_ACTIVE_ID'; id: string }
  | { type: 'SET_COMPLETED'; completedKeys?: Set<string> }
  | { type: 'SET_FAILURE' }
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: State };

export type ProgressAction =
  | { type: 'UPDATE_PROGRESS'; key: string; progress: number }
  | { type: 'REMOVE_PROGRESS'; key: string };
