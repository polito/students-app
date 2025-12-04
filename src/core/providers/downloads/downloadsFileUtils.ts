/**
 * File utility functions: generates file keys, checks file existence, and matches files by context.
 */
import { exists } from 'react-native-fs';

import { QueuedFile } from '../../contexts/DownloadsContext';
import { getFileDatabase } from '../../database/FileDatabase';

export const getFileKey = (file: QueuedFile): string =>
  `${file.url}:${file.filePath}`;

export const checkFileExists = async (file: QueuedFile): Promise<boolean> => {
  try {
    const fileDatabase = getFileDatabase();
    const fileRecord = await fileDatabase.getFileById(file.id);
    if (fileRecord)
      return (await exists(fileRecord.path)) || (await exists(file.filePath));
    return await exists(file.filePath);
  } catch {
    return false;
  }
};

export const matchesContext = (
  file: QueuedFile,
  contextId: string | number,
  contextType?: string,
): boolean =>
  String(file.contextId) === String(contextId) &&
  (contextType === undefined || file.contextType === contextType);
