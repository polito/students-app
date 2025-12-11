import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableHighlightProps } from 'react-native';
import { exists } from 'react-native-fs';

import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import {
  CourseDirectory,
  CourseDirectoryContentInner,
  CourseFileOverview,
} from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';

import {
  DownloadContext,
  DownloadPhase,
  useDownloadsContext,
} from '../../../core/contexts/DownloadsContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useGetCourseFiles } from '../../../core/queries/courseHooks';
import { buildCourseFilePath, buildCourseFileUrl } from '../../../utils/files';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';
import { isDirectory } from '../utils/fs-entry';

const isFile = (item: {
  type: string;
}): item is { type: 'file' } & CourseFileOverview => item.type === 'file';

interface Props {
  courseId: number;
  item: CourseDirectory;
  enableMultiSelect?: boolean;
}

export const CourseDirectoryListItem = ({
  courseId,
  item,
  enableMultiSelect = false,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();
  const { t } = useTranslation();
  const {
    downloads,
    downloadQueue,
    addFilesToQueue,
    removeFilesFromQueue,
    updateDownload,
  } = useDownloadsContext();
  const [courseFilesCache] = useCourseFilesCachePath();
  const courseFilesQuery = useGetCourseFiles(courseId);

  const [filesCheckedFromDB, setFilesCheckedFromDB] = useState<Set<string>>(
    new Set(),
  );
  const fileDatabase = getFileDatabase();

  const checkAllFilesDownloadedFromState = useCallback(() => {
    const directoryFiles = item.files.filter(isFile);

    if (directoryFiles.length === 0) {
      return false;
    }

    return directoryFiles.every(file => {
      const cachedFilePath = buildCourseFilePath(
        courseFilesCache,
        `/${item.name}`,
        file.id,
        file.name,
        file.mimeType,
      );
      const fileUrl = buildCourseFileUrl(courseId, file.id);
      const downloadKey = `${fileUrl}:${cachedFilePath}`;

      if (downloads[downloadKey]?.isDownloaded === true) {
        return true;
      }

      return filesCheckedFromDB.has(file.id);
    });
  }, [item, courseFilesCache, courseId, downloads, filesCheckedFromDB]);

  const allFilesDownloaded = useMemo(
    () => checkAllFilesDownloadedFromState(),
    [checkAllFilesDownloadedFromState],
  );

  const checkAllFilesDownloaded = useCallback(async () => {
    const directoryFiles = item.files.filter(isFile);

    if (directoryFiles.length === 0) {
      return false;
    }

    const fileChecks = await Promise.all(
      directoryFiles.map(async file => {
        const cachedFilePath = buildCourseFilePath(
          courseFilesCache,
          `/${item.name}`,
          file.id,
          file.name,
          file.mimeType,
        );
        const fileExists = await exists(cachedFilePath);
        return fileExists;
      }),
    );

    return fileChecks.every(fileExists => fileExists);
  }, [item, courseFilesCache]);

  useEffect(() => {
    const checkFilesInDatabase = async () => {
      const directoryFiles = item.files.filter(isFile);
      if (directoryFiles.length === 0) return;

      const downloadedFileIds = new Set<string>();

      try {
        const ctx = DownloadContext.Course;
        const ctxId = courseId.toString();
        const allFilesInContext = await fileDatabase.getFilesByContext(
          ctx,
          ctxId,
        );
        const filesMap = new Map(allFilesInContext.map(f => [f.id, f]));

        for (const file of directoryFiles) {
          try {
            const fileRecord = filesMap.get(file.id);
            if (fileRecord) {
              const fileExists = await exists(fileRecord.path);
              if (fileExists) {
                downloadedFileIds.add(file.id);

                const cachedFilePath = buildCourseFilePath(
                  courseFilesCache,
                  `/${item.name}`,
                  file.id,
                  file.name,
                  file.mimeType,
                );
                const fileUrl = buildCourseFileUrl(courseId, file.id);
                const downloadKey = `${fileUrl}:${cachedFilePath}`;

                if (
                  !downloads[downloadKey] ||
                  !downloads[downloadKey].isDownloaded
                ) {
                  updateDownload(downloadKey, {
                    phase: DownloadPhase.Completed,
                    isDownloaded: true,
                  });
                }
              }
            } else {
              const cachedFilePath = buildCourseFilePath(
                courseFilesCache,
                `/${item.name}`,
                file.id,
                file.name,
                file.mimeType,
              );
              const fileExists = await exists(cachedFilePath);
              if (fileExists) {
                downloadedFileIds.add(file.id);
              }
            }
          } catch (error) {}
        }
      } catch (error) {}

      setFilesCheckedFromDB(downloadedFileIds);
    };

    checkFilesInDatabase();
  }, [
    item.files,
    item.name,
    courseFilesCache,
    courseId,
    fileDatabase,
    downloads,
    updateDownload,
  ]);

  useEffect(() => {
    const handleFocus = () => {
      checkAllFilesDownloaded();
    };

    checkAllFilesDownloaded();
    const unsubscribe = navigation.addListener('focus', handleFocus);
    return unsubscribe;
  }, [navigation, checkAllFilesDownloaded]);

  const collectAllFilesRecursively = useCallback(
    (
      directory: CourseDirectory,
      basePath: string,
      allFiles: Array<{
        id: string;
        name: string;
        url: string;
        filePath: string;
      }>,
    ) => {
      const directoryFiles = directory.files.filter(isFile);
      directoryFiles.forEach(file => {
        const fileUrl = buildCourseFileUrl(courseId, file.id);
        const cachedFilePath = buildCourseFilePath(
          courseFilesCache,
          basePath ? `/${basePath}` : undefined,
          file.id,
          file.name,
          file.mimeType,
        );

        allFiles.push({
          id: file.id,
          name: file.name,
          url: fileUrl,
          filePath: cachedFilePath,
        });
      });

      const subDirectories = directory.files.filter(isDirectory);
      subDirectories.forEach(subDir => {
        const subDirPath = basePath
          ? `${basePath}/${subDir.name}`
          : subDir.name;
        collectAllFilesRecursively(subDir, subDirPath, allFiles);
      });
    },
    [courseId, courseFilesCache],
  );

  const getAllFilesInDirectory = useCallback(() => {
    const allFiles: Array<{
      id: string;
      name: string;
      url: string;
      filePath: string;
    }> = [];

    if (courseFilesQuery.data) {
      const findDirectoryRecursive = (
        searchId: string,
        items: CourseDirectoryContentInner[],
      ): CourseDirectory | null => {
        for (const currentItem of items) {
          if (isDirectory(currentItem) && currentItem.id === searchId) {
            return currentItem;
          }
          if (isDirectory(currentItem)) {
            const found = findDirectoryRecursive(searchId, currentItem.files);
            if (found) return found;
          }
        }
        return null;
      };

      const fullDirectory = findDirectoryRecursive(
        item.id,
        courseFilesQuery.data,
      );

      if (fullDirectory) {
        collectAllFilesRecursively(fullDirectory, item.name, allFiles);
      } else {
        collectAllFilesRecursively(item, item.name, allFiles);
      }
    } else {
      collectAllFilesRecursively(item, item.name, allFiles);
    }

    return allFiles;
  }, [courseFilesQuery.data, item, collectAllFilesRecursively]);

  const directoryFileIds = useMemo(
    () => getAllFilesInDirectory().map(file => file.id),
    [getAllFilesInDirectory],
  );

  const isInQueue = useMemo(
    () =>
      directoryFileIds.some(fileId =>
        downloadQueue.files.some(queuedFile => queuedFile.id === fileId),
      ),
    [downloadQueue.files, directoryFileIds],
  );

  const handleSelection = useCallback(() => {
    const allFiles = getAllFilesInDirectory();
    if (allFiles.length === 0) return;

    if (isInQueue) {
      const fileIds = Array.from(new Set(allFiles.map(file => file.id)));
      removeFilesFromQueue(fileIds);
    } else {
      addFilesToQueue(allFiles, courseId, DownloadContext.Course);
    }
  }, [
    isInQueue,
    getAllFilesInDirectory,
    courseId,
    addFilesToQueue,
    removeFilesFromQueue,
  ]);

  const trailingItem = useMemo(
    () =>
      enableMultiSelect ? (
        <Checkbox
          isChecked={isInQueue}
          onPress={handleSelection}
          textStyle={{ marginHorizontal: 0 }}
          containerStyle={{ marginHorizontal: 0, marginVertical: 0 }}
        />
      ) : null,
    [enableMultiSelect, isInQueue, handleSelection],
  );

  return (
    <DirectoryListItem
      title={item.name}
      subtitle={t('courseDirectoryListItem.subtitle', {
        count: item.files.length,
      })}
      onPress={() => {
        if (enableMultiSelect) {
          handleSelection();
        } else {
          navigation.navigate('CourseDirectory', {
            courseId,
            directoryId: item.id,
            directoryName: item.name,
          });
        }
      }}
      trailingItem={trailingItem || undefined}
      isDownloaded={allFilesDownloaded}
      {...rest}
    />
  );
};
