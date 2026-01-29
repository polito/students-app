/**
 * File utility functions: generates file keys, checks file existence, and matches files by context.
 */
import { Dispatch } from 'react';
import { exists, stopDownload, unlink } from 'react-native-fs';

import {
  Download,
  DownloadContext,
  QueuedFile,
} from '../../contexts/DownloadsContext';
import { getFileDatabase } from '../../database/FileDatabase';
import { Action, ProgressAction } from './downloadsTypes';

export const getFileKey = (file: QueuedFile<DownloadContext>): string =>
  `${file.request.source}:${file.request.destination}`;

export const checkPathsExist = async (paths: string[]): Promise<boolean> => {
  for (const path of paths) {
    if (await exists(path).catch(() => false)) {
      return true;
    }
  }
  return false;
};

export const checkFileExists = async (
  file: QueuedFile<DownloadContext>,
): Promise<boolean> => {
  try {
    const fileDatabase = getFileDatabase();
    const fileRecord = await fileDatabase.getFileById(file.id);
    const possiblePaths = [fileRecord?.path, file.request.destination].filter(
      Boolean,
    ) as string[];
    return await checkPathsExist(possiblePaths);
  } catch {
    return false;
  }
};

export const matchesContext = (
  file: QueuedFile<DownloadContext>,
  contextId: string | number,
  contextType?: string,
): boolean =>
  String(file.request.ctxId) === String(contextId) &&
  (contextType === undefined || file.contextType === contextType);

export const findFileById = (
  queue: QueuedFile<DownloadContext>[],
  id: string,
): QueuedFile<DownloadContext> | undefined => {
  return queue.find(f => f.id === id);
};

export const stopActiveDownload = (
  file: QueuedFile<DownloadContext>,
  downloads: Record<string, Omit<Download, 'downloadProgress'>>,
  dispatch: Dispatch<Action>,
  dispatchProgress: Dispatch<ProgressAction>,
  fsStopDownload: typeof stopDownload,
): void => {
  const key = getFileKey(file);
  const download = downloads[key];
  if (download?.jobId !== undefined) {
    fsStopDownload(download.jobId);
  }
  unlink(file.request.destination).catch(() => {});
  dispatch({ type: 'REMOVE_ACTIVE_ID', id: file.id });
  dispatchProgress({ type: 'REMOVE_PROGRESS', key });
};

export const buildAreaString = (area: string, id: string | number): string => {
  return `${area}-${id}`;
};
