import { readDir, stat } from 'react-native-fs';

import { PUBLIC_APP_DIRECTORY_PATH } from '../../constants';
import { getFileDatabase } from '../../database/FileDatabase';
import { calculateFileChecksum } from './downloadsChecksum';

const FILE_ID_REGEX = /\((\d+)\)\.[^.]+$/;
const COURSE_ID_REGEX = /\((\d+)\)$/;

export const syncLocalFilesToDb = async (
  username: string,
  _fileStorageLocation?: 'internal' | 'custom',
): Promise<number> => {
  const fileDatabase = getFileDatabase();
  let syncedCount = 0;

  const basePath = PUBLIC_APP_DIRECTORY_PATH;
  const coursesPath = [basePath, username, 'Courses'].join('/');

  let courseDirs;
  try {
    courseDirs = await readDir(coursesPath);
  } catch {
    return 0;
  }

  for (const courseDir of courseDirs) {
    if (!courseDir.isDirectory()) continue;

    const courseIdMatch = courseDir.name.match(COURSE_ID_REGEX);
    if (!courseIdMatch) continue;
    const courseId = courseIdMatch[1];

    syncedCount += await syncDir(fileDatabase, courseDir.path, courseId);
  }

  return syncedCount;
};

const syncDir = async (
  fileDatabase: ReturnType<typeof getFileDatabase>,
  dirPath: string,
  courseId: string,
): Promise<number> => {
  let entries;
  try {
    entries = await readDir(dirPath);
  } catch {
    return 0;
  }

  let count = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += await syncDir(fileDatabase, entry.path, courseId);
      continue;
    }

    const fileIdMatch = entry.name.match(FILE_ID_REGEX);
    if (!fileIdMatch) continue;
    const fileId = fileIdMatch[1];

    try {
      const existing = await fileDatabase.getFileById(fileId);
      if (existing) continue;

      const fileStats = await stat(entry.path);
      const checksum = await calculateFileChecksum(entry.path, fileStats.size);
      const ext = entry.name.split('.').pop() || 'application/octet-stream';

      await fileDatabase.insertFile({
        id: fileId,
        ctx: 'course',
        ctxId: courseId,
        path: entry.path,
        filename: entry.name,
        mime: ext,
        checksum,
        sizeKb: Math.round(fileStats.size / 1024),
        downloadTime: new Date().toISOString(),
        updateTime: undefined,
      });
      count++;
    } catch (error) {
      console.error(`Failed to sync file ${entry.path}:`, error);
    }
  }

  return count;
};
