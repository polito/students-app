import { splitNameAndExtension } from '../../../utils/files';
import { PUBLIC_APP_DIRECTORY_PATH } from '../../constants';
import { PreferencesContextProps } from '../../contexts/PreferencesContext';
import {
  cacheDirectory,
  copyAsync,
  deleteAsync,
  makeDirectoryAsync,
  readDirectoryWithInfo,
} from '../../storage/fileSystem';

export const migrateCourseFilesCacheToDocumentsDirectory = async (
  preferences: PreferencesContextProps,
) => {
  const { username } = preferences;
  if (!username) {
    return;
  }

  try {
    const courseCachesPath = [cacheDirectory, username, 'Courses'].join('/');
    const courseCaches = await readDirectoryWithInfo(courseCachesPath);
    for (const courseCache of courseCaches) {
      if (courseCache.isDirectory) {
        const newCourseCachePath = [
          PUBLIC_APP_DIRECTORY_PATH,
          username,
          'Courses',
          courseCache.name,
        ].join('/');
        await makeDirectoryAsync(newCourseCachePath);
        const files = await readDirectoryWithInfo(courseCache.path);
        for (const courseFile of files) {
          if (!courseFile.isDirectory) {
            const [name, extension] = splitNameAndExtension(courseFile.name);
            const newPath = [newCourseCachePath, `(${name}).${extension}`].join(
              '/',
            );
            await copyAsync(courseFile.path, newPath);
            await deleteAsync(courseFile.path);
          }
        }
        await deleteAsync(courseCache.path);
      }
    }
    await deleteAsync(courseCachesPath);
  } catch (_) {
    // Empty cache, don't transfer
  }
};
