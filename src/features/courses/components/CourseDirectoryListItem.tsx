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

  const directoryFileIds = useMemo(
    () => item.files.filter(isFile).map(f => f.id),
    [item.files],
  );

  const isInQueue = useMemo(
    () =>
      directoryFileIds.some(fileId =>
        downloadQueue.files.some(queuedFile => queuedFile.id === fileId),
      ),
    [downloadQueue.files, directoryFileIds],
  );

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

      // First check if it's in downloads state
      if (downloads[downloadKey]?.isDownloaded === true) {
        return true;
      }

      // If not in state, check if we've already verified it from DB
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

  // Check files in database when component mounts or directory changes
  useEffect(() => {
    const checkFilesInDatabase = async () => {
      const directoryFiles = item.files.filter(isFile);
      if (directoryFiles.length === 0) return;

      const downloadedFileIds = new Set<string>();

      try {
        const area = `course-${courseId}`;
        const allFilesInArea = await fileDatabase.getFilesByArea(area);
        const filesMap = new Map(allFilesInArea.map(f => [f.id, f]));

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
      // Aggiungi tutti i file della directory corrente
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

      // Per ogni sottodirectory, ricorsivamente aggiungi i suoi file
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

  const handleSelection = useCallback(() => {
    if (isInQueue) {
      removeFilesFromQueue(directoryFileIds);
    } else {
      const allFiles: Array<{
        id: string;
        name: string;
        url: string;
        filePath: string;
      }> = [];

      // Trova la directory completa con tutte le sottodirectory
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
          // Fallback: usa solo i file della directory corrente se non trovata
          collectAllFilesRecursively(item, item.name, allFiles);
        }
      } else {
        // Fallback: usa solo i file della directory corrente
        collectAllFilesRecursively(item, item.name, allFiles);
      }

      if (allFiles.length > 0) {
        addFilesToQueue(allFiles, courseId, 'course');
      }
    }
  }, [
    isInQueue,
    directoryFileIds,
    item,
    courseId,
    courseFilesQuery.data,
    collectAllFilesRecursively,
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
