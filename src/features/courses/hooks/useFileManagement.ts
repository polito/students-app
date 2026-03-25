import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  faCloudArrowDown,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  CourseDirectory,
  CourseFileOverview,
} from '@polito/student-api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DownloadContext,
  useDownloadsContext,
} from '../../../core/contexts/DownloadsContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useDownloadQueue } from '../../../core/hooks/useDownloadQueue';
import { getFileKey } from '../../../core/providers/downloads/downloadsQueue';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { buildCourseFileUrl } from '../../../utils/files';
import { sortByNameAsc, sortByNameDesc } from '../../../utils/sorting';
import { isDirectory } from '../utils/fs-entry';

const FILE_SORT_KEYS = [
  'nameAZ',
  'nameZA',
  'downloadStatus',
  'newest',
  'oldest',
];
const DIRECTORY_SORT_KEYS = ['nameAZ', 'nameZA'];
const sortStorageCache = new Map<string, string>();

interface UseFileManagementProps {
  courseId: number;
  data: (CourseDirectory | CourseFileOverview)[] | null | undefined;
  isDirectoryView?: boolean;
}

export const useFileManagement = ({
  courseId,
  data,
  isDirectoryView = false,
}: UseFileManagementProps) => {
  const { t } = useTranslation();
  const { colors, palettes, spacing } = useTheme();
  const {
    getCourseFilePath,
    removeFileFromStorage,
    refreshCacheVersion,
    cacheSizeVersion,
  } = useDownloadsContext();
  const { data: course } = useGetCourse(courseId);
  const {
    downloads,
    downloadQueue,
    contextFiles: courseFiles,
    isDownloading,
    hasFiles,
    addFiles,
    removeFiles,
    clearFiles,
    startDownload,
    stopDownload,
  } = useDownloadQueue(courseId, DownloadContext.Course);
  const { updateDownload, setRemovalInProgress } = useDownloadsContext();
  const fileDatabase = getFileDatabase();

  const [enableMultiSelect, setEnableMultiSelect] = useState(false);
  const [allFilesSelectedState, setAllFilesSelectedState] = useState(false);
  const [sortedData, setSortedData] = useState<typeof data>(undefined);
  const [wasDownloading, setWasDownloading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [downloadedFileIdsFromDb, setDownloadedFileIdsFromDb] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    if (courseId == null) return;
    const ctx = DownloadContext.Course;
    const ctxId = courseId.toString();
    fileDatabase
      .getFilesByContext(ctx, ctxId)
      .then(files => setDownloadedFileIdsFromDb(new Set(files.map(f => f.id))))
      .catch(() => setDownloadedFileIdsFromDb(new Set()));
  }, [courseId, cacheSizeVersion, fileDatabase]);

  const sortOptions = useMemo(() => {
    const base = [
      {
        id: t('common.orderByNameAZ'),
        title: t('common.orderByNameAZ'),
        sortKey: 'nameAZ' as const,
      },
      {
        id: t('common.orderByNameZA'),
        title: t('common.orderByNameZA'),
        sortKey: 'nameZA' as const,
      },
    ];
    if (isDirectoryView) return base;
    return [
      ...base,
      {
        id: t('common.downloadStatus.false'),
        title: t('common.downloadStatus.false'),
        sortKey: 'downloadStatus' as const,
      },
      {
        id: t('common.newest'),
        title: t('common.newest'),
        sortKey: 'newest' as const,
      },
      {
        id: t('common.oldest'),
        title: t('common.oldest'),
        sortKey: 'oldest' as const,
      },
    ];
  }, [t, isDirectoryView]);

  const SORT_STORAGE_KEY_BASE = `@files_sort_${courseId}`;
  const SORT_STORAGE_KEY_DIR = `${SORT_STORAGE_KEY_BASE}_directories`;
  const SORT_STORAGE_KEY_FILE = `${SORT_STORAGE_KEY_BASE}_files`;
  const SORT_STORAGE_KEY = isDirectoryView
    ? SORT_STORAGE_KEY_DIR
    : SORT_STORAGE_KEY_FILE;
  const [activeSort, setActiveSort] = useState(() => {
    const cachedSortKey = sortStorageCache.get(SORT_STORAGE_KEY);
    if (cachedSortKey) {
      const idx = isDirectoryView
        ? DIRECTORY_SORT_KEYS.indexOf(cachedSortKey)
        : FILE_SORT_KEYS.indexOf(cachedSortKey);
      if (idx >= 0 && idx < sortOptions.length) {
        return sortOptions[idx].title;
      }
    }
    if (isDirectoryView) {
      return sortOptions[0].title;
    }
    const newestIdx = FILE_SORT_KEYS.indexOf('newest');
    return newestIdx >= 0 && newestIdx < sortOptions.length
      ? sortOptions[newestIdx].title
      : sortOptions[0].title;
  });

  const sortKeys = isDirectoryView ? DIRECTORY_SORT_KEYS : FILE_SORT_KEYS;

  useEffect(() => {
    AsyncStorage.getItem(SORT_STORAGE_KEY)
      .then(stored => {
        if (!stored) {
          if (isDirectoryView) return;

          const sortKeyToUse = 'newest';
          const idx = FILE_SORT_KEYS.indexOf(sortKeyToUse);
          if (idx >= 0 && idx < sortOptions.length) {
            setActiveSort(sortOptions[idx].title);
            sortStorageCache.set(SORT_STORAGE_KEY, sortKeyToUse);
            AsyncStorage.setItem(SORT_STORAGE_KEY, sortKeyToUse).catch(
              () => {},
            );
          }
          return;
        }
        sortStorageCache.set(SORT_STORAGE_KEY, stored);
        const idx = sortKeys.indexOf(stored);
        if (idx >= 0 && idx < sortOptions.length) {
          setActiveSort(sortOptions[idx].title);
        }
      })
      .catch(() => {});
  }, [isDirectoryView, sortKeys, sortOptions, SORT_STORAGE_KEY]);

  const allFilesSelected = useMemo(() => {
    if (!enableMultiSelect) return false;
    return allFilesSelectedState;
  }, [enableMultiSelect, allFilesSelectedState]);

  const downloadButtonIcon = useMemo(() => {
    return isDownloading ? faXmark : faCloudArrowDown;
  }, [isDownloading]);

  const downloadButtonProgress = useMemo(() => {
    if (!isDownloading) return undefined;
    return downloadQueue.overallProgress;
  }, [isDownloading, downloadQueue.overallProgress]);

  const selectedDownloadedFiles = useMemo(() => {
    if (!isDownloading && courseFiles.length === 0) return [];
    return courseFiles.filter(file => downloadedFileIdsFromDb.has(file.id));
  }, [courseFiles, downloadedFileIdsFromDb, isDownloading]);

  const selectedNotDownloadedFiles = useMemo(() => {
    if (!isDownloading && courseFiles.length === 0) return [];
    return courseFiles.filter(file => !downloadedFileIdsFromDb.has(file.id));
  }, [courseFiles, downloadedFileIdsFromDb, isDownloading]);

  const downloadButtonTitle = useMemo(() => {
    const notDownloadedCount = selectedNotDownloadedFiles.length;
    return notDownloadedCount > 0
      ? `${t('common.download')} (${notDownloadedCount})`
      : t('common.download');
  }, [selectedNotDownloadedFiles.length, t]);

  const hasDownloadedFiles = selectedDownloadedFiles.length > 0;

  const isDownloadButtonDisabled = useMemo(() => {
    return courseFiles.length === 0 && !isDownloading;
  }, [courseFiles.length, isDownloading]);

  const downloadButtonStyle = useMemo(() => {
    if (isDownloadButtonDisabled) {
      return {
        backgroundColor: colors.secondaryText,
        borderColor: colors.secondaryText,
      };
    }
    return {
      backgroundColor: palettes.primary[400],
      borderColor: palettes.primary[400],
    };
  }, [isDownloadButtonDisabled, colors.secondaryText, palettes]);

  const removeButtonTitle = useMemo(() => {
    return hasDownloadedFiles
      ? `${t('common.remove')} (${selectedDownloadedFiles.length})`
      : t('common.remove');
  }, [hasDownloadedFiles, selectedDownloadedFiles.length, t]);

  const isRemoveButtonDisabled = useMemo(() => {
    return !hasDownloadedFiles;
  }, [hasDownloadedFiles]);

  const removeButtonStyle = useMemo(() => {
    if (isRemoveButtonDisabled) {
      return {
        backgroundColor: colors.secondaryText,
        borderColor: colors.secondaryText,
        marginBottom: spacing[16],
      };
    }
    return {
      backgroundColor: palettes.danger[600],
      borderColor: palettes.danger[600],
      marginBottom: spacing[16],
    };
  }, [isRemoveButtonDisabled, colors.secondaryText, palettes, spacing]);

  const sortByDownloadStatus = useCallback(
    (files: (CourseDirectory | CourseFileOverview)[]) => {
      if (!downloads || Object.keys(downloads).length === 0) {
        return files;
      }
      return files.sort((a, b) => {
        const aFilePath = getCourseFilePath({
          courseId,
          courseName: course?.name,
          location: (a as any).location,
          fileId: a.id,
          fileName: a.name,
          mimeType: (a as any).mimeType,
        });
        const aKey = `${buildCourseFileUrl(courseId, a.id)}:${aFilePath}`;

        const bFilePath = getCourseFilePath({
          courseId,
          courseName: course?.name,
          location: (b as any).location,
          fileId: b.id,
          fileName: b.name,
          mimeType: (b as any).mimeType,
        });
        const bKey = `${buildCourseFileUrl(courseId, b.id)}:${bFilePath}`;

        const aDownloaded = downloads[aKey]?.isDownloaded ?? false;
        const bDownloaded = downloads[bKey]?.isDownloaded ?? false;
        if (aDownloaded && !bDownloaded) return 1;
        if (!aDownloaded && bDownloaded) return -1;
        return 0;
      });
    },
    [courseId, course?.name, getCourseFilePath, downloads],
  );

  const sortByDate = useCallback(
    (files: (CourseDirectory | CourseFileOverview)[], ascending = false) => {
      return files.sort((a, b) => {
        const aDate = (a as CourseFileOverview).createdAt
          ? new Date((a as CourseFileOverview).createdAt).getTime()
          : 0;
        const bDate = (b as CourseFileOverview).createdAt
          ? new Date((b as CourseFileOverview).createdAt).getTime()
          : 0;
        return ascending ? aDate - bDate : bDate - aDate;
      });
    },
    [],
  );

  const selectAllFiles = useCallback(async () => {
    if (!sortedData) return;

    const allFiles: Array<{
      id: string;
      name: string;
      location?: string;
      sizeInKiloBytes?: number;
    }> = [];

    sortedData.forEach(item => {
      if (isDirectoryView && isDirectory(item as any)) {
        const directoryFiles = (item as any).files.filter(
          (file: any) => file.type === 'file',
        );
        directoryFiles.forEach((file: any) => {
          allFiles.push({
            id: file.id,
            name: file.name,
            location: `/${item.name}`,
            sizeInKiloBytes: file.sizeInKiloBytes,
          });
        });
      } else {
        allFiles.push({
          id: item.id,
          name: item.name,
          location: (item as any).location,
          sizeInKiloBytes: (item as any).sizeInKiloBytes,
        });
      }
    });

    const filesToAdd = allFiles.map(file => {
      const fileUrl = buildCourseFileUrl(courseId, file.id);
      const cachedFilePath = getCourseFilePath({
        courseId,
        courseName: course?.name,
        location: file.location,
        fileId: file.id,
        fileName: file.name,
      });

      return {
        id: file.id,
        name: file.name,
        url: fileUrl,
        filePath: cachedFilePath,
        sizeInKiloBytes: file.sizeInKiloBytes,
      };
    });

    if (filesToAdd.length > 0) {
      addFiles(filesToAdd);
      setAllFilesSelectedState(true);
    } else {
      setAllFilesSelectedState(true);
    }
  }, [
    sortedData,
    addFiles,
    courseId,
    course?.name,
    getCourseFilePath,
    isDirectoryView,
  ]);

  const deselectAllFiles = useCallback(() => {
    if (!sortedData) return;

    const allFileIds: string[] = [];

    sortedData.forEach(item => {
      if (isDirectoryView && isDirectory(item as any)) {
        const directoryFiles = (item as any).files.filter(
          (file: any) => file.type === 'file',
        );
        directoryFiles.forEach((file: any) => {
          allFileIds.push(file.id);
        });
      } else {
        allFileIds.push(item.id);
      }
    });

    removeFiles(allFileIds);
    setAllFilesSelectedState(false);
  }, [sortedData, removeFiles, isDirectoryView]);

  const toggleMultiSelect = useCallback(() => {
    if (enableMultiSelect) {
      deselectAllFiles();
      setEnableMultiSelect(false);
      clearFiles();
      setAllFilesSelectedState(false);
    } else {
      clearFiles();
      setEnableMultiSelect(true);
      setAllFilesSelectedState(false);
    }
  }, [enableMultiSelect, deselectAllFiles, clearFiles]);

  const toggleSelectAll = useCallback(() => {
    if (allFilesSelected) {
      deselectAllFiles();
    } else {
      selectAllFiles();
    }
  }, [allFilesSelected, deselectAllFiles, selectAllFiles]);

  const applySortToData = useCallback(
    (event: string, sourceData: typeof data) => {
      if (!sourceData) return;

      const opt = sortOptions.find(o => o.id === event);
      const sortKey = opt?.sortKey;

      if (isDirectoryView) {
        let sortedItems = sourceData;

        switch (sortKey) {
          case 'nameAZ':
            sortedItems = sortByNameAsc(sourceData);
            break;
          case 'nameZA':
            sortedItems = sortByNameDesc(sourceData);
            break;
          default:
            break;
        }

        setSortedData(sortedItems);
      } else {
        let sortedFiles = sourceData;

        switch (sortKey) {
          case 'nameAZ':
            sortedFiles = sortByNameAsc(sourceData);
            break;
          case 'nameZA':
            sortedFiles = sortByNameDesc(sourceData);
            break;
          case 'downloadStatus':
            sortedFiles = sortByDownloadStatus(sourceData);
            break;
          case 'newest':
            sortedFiles = sortByDate(sourceData, false);
            break;
          case 'oldest':
            sortedFiles = sortByDate(sourceData, true);
            break;
          default:
            break;
        }

        setSortedData(sortedFiles);
      }
    },
    [isDirectoryView, sortOptions, sortByDownloadStatus, sortByDate],
  );

  useEffect(() => {
    if (!data) {
      setSortedData(undefined);
      return;
    }
    applySortToData(activeSort, data);
  }, [data, activeSort, applySortToData]);

  const onPressSortOption = useCallback(
    (event: string) => {
      setActiveSort(event);
      const opt = sortOptions.find(o => o.id === event);
      if (opt) {
        const sortKey = opt.sortKey as string;
        sortStorageCache.set(SORT_STORAGE_KEY, sortKey);
        AsyncStorage.setItem(SORT_STORAGE_KEY, sortKey).catch(() => {});
      }
      applySortToData(event, data);
    },
    [data, sortOptions, applySortToData, SORT_STORAGE_KEY],
  );

  const handleDownloadAction = useCallback(() => {
    if (isDownloading) {
      stopDownload();
    } else if (hasFiles) {
      startDownload();
    }
  }, [isDownloading, hasFiles, stopDownload, startDownload]);

  const handleRemoveAction = useCallback(
    (onConfirmed?: () => void) => {
      if (!hasDownloadedFiles) return;

      const fileCount = selectedDownloadedFiles.length;
      const message =
        fileCount === 1
          ? t('courseFilesTab.removeFileConfirmation')
          : t('courseFilesTab.removeFilesConfirmation', { count: fileCount });

      Alert.alert(t('courseFilesTab.removeFilesTitle'), message, [
        {
          text: t('common.no'),
          style: 'cancel',
        },
        {
          text: t('common.yes'),
          onPress: async () => {
            onConfirmed?.();
            setIsRemoving(true);
            setRemovalInProgress(true);
            try {
              const ctx = DownloadContext.Course;
              const ctxId = courseId.toString();
              const filesFromDb = await fileDatabase.getFilesByContext(
                ctx,
                ctxId,
              );
              const dbFilesById = new Map(filesFromDb.map(f => [f.id, f]));

              const removePromises = selectedDownloadedFiles.map(async file => {
                const key = getFileKey(file);
                const fileRecord = dbFilesById.get(file.id);
                const filePath = fileRecord?.path ?? file.request.destination;

                try {
                  await removeFileFromStorage(filePath);
                } catch (error) {
                  console.error(`Error removing file ${filePath}:`, error);
                }

                try {
                  await fileDatabase.deleteFile(file.id);
                } catch (error) {
                  console.error(
                    `Error removing file metadata from SQLite for ${file.id}:`,
                    error,
                  );
                }

                updateDownload(key, {
                  jobId: undefined,
                  isDownloaded: false,
                  downloadProgress: undefined,
                });
              });

              await Promise.all(removePromises);

              refreshCacheVersion();

              const fileIdsToRemove = selectedDownloadedFiles.map(
                file => file.id,
              );
              removeFiles(fileIdsToRemove);

              setEnableMultiSelect(false);
              clearFiles();
              setAllFilesSelectedState(false);
            } finally {
              setIsRemoving(false);
              setRemovalInProgress(false);
            }
          },
        },
      ]);
    },
    [
      hasDownloadedFiles,
      selectedDownloadedFiles,
      courseId,
      t,
      fileDatabase,
      updateDownload,
      removeFiles,
      clearFiles,
      setRemovalInProgress,
      removeFileFromStorage,
      refreshCacheVersion,
    ],
  );

  const renderCtaButtons = useCallback(
    (useContainer: boolean = false) => {
      if (!enableMultiSelect) return null;

      const removeButton = !isDownloading
        ? React.createElement(CtaButton, {
            title: removeButtonTitle,
            icon: faTrash,
            action: handleRemoveAction,
            style: removeButtonStyle,
            disabled: isRemoveButtonDisabled,
            absolute: true,
            destructive: true,
          })
        : null;

      const downloadButton = !isRemoving
        ? React.createElement(CtaButton, {
            title: downloadButtonTitle,
            icon: downloadButtonIcon,
            action: handleDownloadAction,
            progress: downloadButtonProgress,
            style: downloadButtonStyle,
            disabled: isDownloadButtonDisabled,
            absolute: true,
          })
        : null;

      const buttons = React.createElement(
        React.Fragment,
        null,
        removeButton,
        downloadButton,
      );

      if (useContainer) {
        return React.createElement(
          CtaButtonContainer,
          { absolute: false },
          buttons,
        );
      }

      return buttons;
    },
    [
      enableMultiSelect,
      isDownloading,
      isRemoving,
      removeButtonTitle,
      handleRemoveAction,
      removeButtonStyle,
      isRemoveButtonDisabled,
      downloadButtonTitle,
      downloadButtonIcon,
      handleDownloadAction,
      downloadButtonProgress,
      downloadButtonStyle,
      isDownloadButtonDisabled,
    ],
  );

  useEffect(() => {
    if (isDownloading) {
      setWasDownloading(true);
    } else if (
      wasDownloading &&
      !isDownloading &&
      enableMultiSelect &&
      (downloadQueue.hasCompleted || !hasFiles)
    ) {
      setEnableMultiSelect(false);
      setWasDownloading(false);
      clearFiles();
      setAllFilesSelectedState(false);
    }
  }, [
    isDownloading,
    wasDownloading,
    enableMultiSelect,
    downloadQueue.hasCompleted,
    hasFiles,
    clearFiles,
  ]);

  return {
    enableMultiSelect,
    setEnableMultiSelect,
    allFilesSelected,
    sortedData,
    setSortedData,
    activeSort,
    sortOptions,

    toggleMultiSelect,
    toggleSelectAll,
    onPressSortOption,
    handleDownloadAction,
    handleRemoveAction,
    stopDownload,

    downloadButtonTitle,
    downloadButtonIcon,
    downloadButtonProgress,
    downloadButtonStyle,
    isDownloadButtonDisabled,
    isDownloading,
    downloadCurrentIndex: downloadQueue.currentFileIndex + 1,
    downloadTotalCount: courseFiles.length,

    removeButtonTitle,
    removeButtonStyle,
    isRemoveButtonDisabled,
    isRemoving,

    renderCtaButtons,
  };
};
