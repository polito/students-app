import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableHighlightProps } from 'react-native';

import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import {
  CourseDirectory,
  CourseDirectoryEntry,
  CourseFileOverview,
} from '@polito/student-api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';

import {
  DownloadContext,
  useDownloadsContext,
} from '../../../core/contexts/DownloadsContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useNotifications } from '../../../core/hooks/useNotifications';
import {
  useGetCourse,
  useGetCourseFiles,
} from '../../../core/queries/courseHooks';
import {
  buildCourseFileUrl,
  formatFileSize,
  stripIdInParentheses,
} from '../../../utils/files';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { isDirectory } from '../utils/fs-entry';

const isFile = (item: {
  type: string;
}): item is { type: 'file' } & CourseFileOverview => item.type === 'file';

const getDirectoryStatsRecursive = (
  dir: CourseDirectory,
): { fileCount: number; totalSizeInKiloBytes: number } => {
  let fileCount = 0;
  let totalSizeInKiloBytes = 0;
  for (const entry of dir.files) {
    if (isFile(entry)) {
      fileCount += 1;
      totalSizeInKiloBytes += entry.sizeInKiloBytes ?? 0;
    } else {
      const sub = getDirectoryStatsRecursive(entry);
      fileCount += sub.fileCount;
      totalSizeInKiloBytes += sub.totalSizeInKiloBytes;
    }
  }
  return { fileCount, totalSizeInKiloBytes };
};

interface Props {
  courseId: number;
  item: CourseDirectory;
  enableMultiSelect?: boolean;
  listRefreshKey?: number;
  onCheckComplete?: () => void;
  disabled?: boolean;
  onLongPress?: (fileIds: string[]) => void;
}

export const CourseDirectoryListItem = ({
  courseId,
  item,
  enableMultiSelect = false,
  listRefreshKey,
  onCheckComplete,
  onLongPress,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress' | 'onLongPress'> & Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();
  const { t } = useTranslation();
  const {
    downloads,
    downloadQueue,
    getFilesByContext,
    addFilesToQueue,
    removeFilesFromQueue,
    updateDownload,
    getCourseFilePath,
    fileExistsInStorage,
    cacheSizeVersion,
  } = useDownloadsContext();
  const { data: course } = useGetCourse(courseId);
  const courseFilesQuery = useGetCourseFiles(courseId);
  const { getUnreadsCount } = useNotifications();

  const [filesCheckedFromDB, setFilesCheckedFromDB] = useState<Set<string>>(
    new Set(),
  );
  const [isCheckingDownloaded, setIsCheckingDownloaded] = useState(true);
  const fileDatabase = getFileDatabase();
  const downloadsRef = useRef(downloads);
  const updateDownloadRef = useRef(updateDownload);
  downloadsRef.current = downloads;
  updateDownloadRef.current = updateDownload;

  const collectAllFilesRecursively = useCallback(
    (
      directory: CourseDirectory,
      basePath: string,
      allFiles: Array<{
        id: string;
        name: string;
        url: string;
        filePath: string;
        sizeInKiloBytes?: number;
        checksum?: string;
      }>,
    ) => {
      const directoryFiles = directory.files.filter(isFile);
      directoryFiles.forEach((file: CourseFileOverview) => {
        const fileUrl = buildCourseFileUrl(courseId, file.id);
        const cachedFilePath = getCourseFilePath({
          courseId,
          courseName: course?.name,
          location: basePath ? `/${basePath}` : undefined,
          fileId: file.id,
          fileName: file.name,
          mimeType: file.mimeType,
        });

        allFiles.push({
          id: file.id,
          name: file.name,
          url: fileUrl,
          filePath: cachedFilePath,
          sizeInKiloBytes: file.sizeInKiloBytes,
          checksum: file.checksum,
        });
      });

      const subDirectories = directory.files.filter(isDirectory);
      subDirectories.forEach((subDir: CourseDirectory) => {
        const segmentName = stripIdInParentheses(subDir.name);
        const subDirPath = basePath
          ? `${basePath}/${segmentName}`
          : segmentName;
        collectAllFilesRecursively(subDir, subDirPath, allFiles);
      });
    },
    [courseId, course?.name, getCourseFilePath],
  );

  const getAllFilesInDirectory = useCallback(() => {
    const allFiles: Array<{
      id: string;
      name: string;
      url: string;
      filePath: string;
      sizeInKiloBytes?: number;
      checksum?: string;
    }> = [];

    if (courseFilesQuery.data) {
      const findDirectoryRecursive = (
        searchId: string,
        items: CourseDirectoryEntry[],
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
        collectAllFilesRecursively(
          fullDirectory,
          stripIdInParentheses(item.name),
          allFiles,
        );
      } else {
        collectAllFilesRecursively(
          item,
          stripIdInParentheses(item.name),
          allFiles,
        );
      }
    } else {
      collectAllFilesRecursively(
        item,
        stripIdInParentheses(item.name),
        allFiles,
      );
    }

    return allFiles;
  }, [courseFilesQuery.data, item, collectAllFilesRecursively]);

  const allFilesWithKeys = useMemo(
    () =>
      getAllFilesInDirectory().map(f => ({
        id: f.id,
        key: `${f.url}:${f.filePath}`,
      })),
    [getAllFilesInDirectory],
  );

  const checkAllFilesDownloadedFromState = useCallback(() => {
    if (allFilesWithKeys.length === 0) {
      return false;
    }
    if (isCheckingDownloaded) {
      return false;
    }
    return allFilesWithKeys.every(f => {
      if (downloadQueue.activeDownloadIds.has(f.id)) return false;
      return filesCheckedFromDB.has(f.id);
    });
  }, [
    allFilesWithKeys,
    isCheckingDownloaded,
    filesCheckedFromDB,
    downloadQueue.activeDownloadIds,
  ]);

  const allFilesDownloaded = useMemo(
    () => checkAllFilesDownloadedFromState(),
    [checkAllFilesDownloadedFromState],
  );

  useEffect(() => {
    const allFiles = getAllFilesInDirectory();
    if (allFiles.length === 0) {
      setIsCheckingDownloaded(false);
      setFilesCheckedFromDB(new Set());
      return;
    }

    let cancelled = false;
    const run = async () => {
      const downloadedFileIds = new Set<string>();
      try {
        const allFilesInContext = await fileDatabase.getFilesByContext(
          DownloadContext.Course,
          courseId.toString(),
        );
        if (cancelled) return;
        const filesMap = new Map(allFilesInContext.map(f => [f.id, f]));

        for (const file of allFiles) {
          if (cancelled) return;
          const fileRecord = filesMap.get(file.id);
          if (!fileRecord) continue;
          const isOutdated =
            file.checksum &&
            fileRecord.checksum &&
            file.checksum !== fileRecord.checksum;
          if (isOutdated) continue;
          const existsOnDisk = await fileExistsInStorage(file.filePath);
          if (existsOnDisk) downloadedFileIds.add(file.id);
        }
      } catch {
      } finally {
        if (!cancelled) {
          setIsCheckingDownloaded(false);
          setFilesCheckedFromDB(downloadedFileIds);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    getAllFilesInDirectory,
    courseId,
    fileDatabase,
    fileExistsInStorage,
    listRefreshKey,
    cacheSizeVersion,
  ]);

  useEffect(() => {
    if (!isCheckingDownloaded) {
      onCheckComplete?.();
    }
  }, [isCheckingDownloaded, onCheckComplete]);

  const directoryFileIds = useMemo(
    () => getAllFilesInDirectory().map(file => file.id),
    [getAllFilesInDirectory],
  );

  const queueFilesForCourse = useMemo(
    () => getFilesByContext(courseId, DownloadContext.Course),
    [getFilesByContext, courseId],
  );

  const isInQueue = useMemo(
    () =>
      directoryFileIds.some(fileId =>
        queueFilesForCourse.some(queuedFile => queuedFile.id === fileId),
      ),
    [queueFilesForCourse, directoryFileIds],
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
      ) : isCheckingDownloaded ? null : null,
    [enableMultiSelect, isInQueue, handleSelection, isCheckingDownloaded],
  );

  const hasUnreadFiles = useMemo(() => {
    const allFiles = getAllFilesInDirectory();
    const totalUnreads = allFiles.reduce((count, file) => {
      const fileNotificationScope = [
        'teaching',
        'courses',
        courseId.toString(),
        'files',
        file.id,
      ] as const;
      const unreadCount = getUnreadsCount(fileNotificationScope) ?? 0;
      return count + unreadCount;
    }, 0);
    return totalUnreads > 0;
  }, [courseId, getAllFilesInDirectory, getUnreadsCount]);

  const fullDirectory = useMemo(() => {
    if (!courseFilesQuery.data) return null;
    const findDirectoryRecursive = (
      searchId: string,
      items: CourseDirectoryEntry[],
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
    return findDirectoryRecursive(item.id, courseFilesQuery.data) ?? item;
  }, [courseFilesQuery.data, item]);

  const { fileCount: recursiveFileCount, totalSizeInKiloBytes } = useMemo(
    () => getDirectoryStatsRecursive(fullDirectory ?? item),
    [fullDirectory, item],
  );

  const folderCount = useMemo(
    () => item.files.filter(isDirectory).length,
    [item.files],
  );

  const subtitle = useMemo(() => {
    const countParts: string[] = [];
    if (recursiveFileCount > 0) {
      countParts.push(
        t('courseDirectoryListItem.fileCount', {
          count: recursiveFileCount,
        }),
      );
    }
    if (folderCount > 0) {
      countParts.push(
        t('courseDirectoryListItem.folderCount', {
          count: folderCount,
        }),
      );
    }
    const countText = countParts.join(', ');
    const sizeText =
      totalSizeInKiloBytes > 0 ? formatFileSize(totalSizeInKiloBytes) : '';
    if (countText && sizeText) {
      return `${countText} - ${sizeText}`;
    }
    return countText || sizeText || t('courseDirectoryListItem.empty');
  }, [recursiveFileCount, folderCount, totalSizeInKiloBytes, t]);

  return (
    <DirectoryListItem
      accessibilityRole="button"
      accessible
      accessibilityLabel={[
        t('common.directory'),
        stripIdInParentheses(item.name),
        subtitle,
        t('courseFilesTab.openDirectory'),
      ].join(', ')}
      title={stripIdInParentheses(item.name)}
      subtitle={subtitle}
      onPress={() => {
        if (enableMultiSelect) {
          handleSelection();
        } else {
          navigation.navigate('CourseDirectory', {
            courseId,
            directoryId: item.id,
            directoryName: stripIdInParentheses(item.name),
            skipInitialDownloadCheck: allFilesDownloaded,
          });
        }
      }}
      onLongPress={
        onLongPress
          ? () => onLongPress(getAllFilesInDirectory().map(f => f.id))
          : undefined
      }
      trailingItem={trailingItem || undefined}
      isDownloaded={allFilesDownloaded}
      unread={hasUnreadFiles}
      {...rest}
    />
  );
};
