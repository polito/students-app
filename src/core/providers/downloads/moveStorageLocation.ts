import { mkdir, moveFile, readDir } from 'react-native-fs';

import { getFileDatabase } from '../../database/FileDatabase';

export const moveAllFiles = async (
  username: string,
  fromBasePath: string,
  toBasePath: string,
): Promise<number> => {
  const fileDatabase = getFileDatabase();
  const fromCoursesPath = [fromBasePath, username, 'Courses'].join('/');
  let movedCount = 0;

  const processDir = async (dirPath: string, relativePath: string) => {
    let entries;
    try {
      entries = await readDir(dirPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subRelative = [relativePath, entry.name]
          .filter(Boolean)
          .join('/');
        await processDir(entry.path, subRelative);
      } else {
        const destDir = [toBasePath, username, 'Courses', relativePath]
          .filter(Boolean)
          .join('/');
        const destPath = [destDir, entry.name].join('/');

        try {
          await mkdir(destDir);
          await moveFile(entry.path, destPath);

          const fileIdMatch = entry.name.match(/\((\d+)\)\.[^.]+$/);
          if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            await fileDatabase
              .updateFile(fileId, { path: destPath })
              .catch(() => {});
          }
          movedCount++;
        } catch (error) {
          console.error(`Failed to move ${entry.path}:`, error);
        }
      }
    }
  };

  try {
    await processDir(fromCoursesPath, '');
  } catch (error) {
    console.error('moveAllFiles error:', error);
  }

  return movedCount;
};
