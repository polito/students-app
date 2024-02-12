import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
  mkdir,
  moveFile,
  readDir,
  unlink,
} from 'react-native-fs';

import { splitNameAndExtension } from '../../../utils/files';
import { PreferencesContextProps } from '../../contexts/PreferencesContext';

export const migrateCourseFilesCacheToDocumentsDirectory = async (
  preferences: PreferencesContextProps,
) => {
  const { username } = preferences;
  if (!username) {
    return;
  }

  try {
    const courseCachesPath = [CachesDirectoryPath, username, 'Courses'].join(
      '/',
    );
    const courseCaches = await readDir(courseCachesPath);
    for (const courseCache of courseCaches) {
      if (courseCache.isDirectory()) {
        const newCourseCachePath = [
          DocumentDirectoryPath,
          username,
          'Courses',
          courseCache.name,
        ].join('/');
        await mkdir(newCourseCachePath);
        const files = await readDir(courseCache.path);
        for (const courseFile of files) {
          if (courseFile.isFile()) {
            const [name, extension] = splitNameAndExtension(courseFile.name);
            const newPath = [newCourseCachePath, `(${name}).${extension}`].join(
              '/',
            );
            await moveFile(courseFile.path, newPath);
          }
        }
        await unlink(courseCache.path);
      }
    }
    await unlink(courseCachesPath);
  } catch (_) {
    // Empty cache, don't transfer
  }
};
