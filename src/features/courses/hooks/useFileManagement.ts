import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exists } from 'react-native-fs';

import { faCloudArrowDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  BASE_PATH,
  CourseDirectory,
  CourseFileOverview,
} from '@polito/api-client';
import { useFocusEffect } from '@react-navigation/native';

import { useGenericDownload } from '../../../core/hooks/useDownloadQueue';
import { splitNameAndExtension } from '../../../utils/files';
import { sortByNameAsc, sortByNameDesc } from '../../../utils/sorting';
import { CourseFilesCacheContext } from '../contexts/CourseFilesCacheContext';
import { isDirectory } from '../utils/fs-entry';

interface UseFileManagementProps {
  courseId: number;
  courseFilesCache: string;
  data: (CourseDirectory | CourseFileOverview)[] | null | undefined;
  isDirectoryView?: boolean;
}

export const useFileManagement = ({
  courseId,
  courseFilesCache,
  data,
  isDirectoryView = false,
}: UseFileManagementProps) => {
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const { refresh } = useContext(CourseFilesCacheContext);
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
  } = useGenericDownload(courseId, 'course');

  // File cache refresh on focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // State
  const [enableMultiSelect, setEnableMultiSelect] = useState(false);
  const [allFilesSelectedState, setAllFilesSelectedState] = useState(false);
  const [sortedData, setSortedData] = useState<typeof data>(undefined);
  const [wasDownloading, setWasDownloading] = useState(false);

  // Sort options
  const sortOptions = useMemo(
    () => [
      {
        id: t('common.orderByNameAZ'),
        title: t('common.orderByNameAZ'),
      },
      {
        id: t('common.orderByNameZA'),
        title: t('common.orderByNameZA'),
      },
      {
        id: t('common.downloadStatus.false'),
        title: t('common.downloadStatus.false'),
      },
      {
        id: t('common.newest'),
        title: t('common.newest'),
      },
      {
        id: t('common.oldest'),
        title: t('common.oldest'),
      },
    ],
    [t],
  );

  const [activeSort, setActiveSort] = useState(sortOptions[0].title);

  // Multi-select state
  const allFilesSelected = useMemo(() => {
    if (!enableMultiSelect) return false;
    return allFilesSelectedState;
  }, [enableMultiSelect, allFilesSelectedState]);

  // Download actions (using courseFiles from useGenericDownload)

  const downloadButtonTitle = useMemo(() => {
    return isDownloading
      ? t('common.downloadProgress', {
          current: Math.min(
            downloadQueue.currentFileIndex + 1,
            courseFiles.length,
          ),
          total: courseFiles.length,
        })
      : hasFiles
        ? `${t('common.download')} (${courseFiles.length})`
        : t('common.download');
  }, [
    isDownloading,
    courseFiles.length,
    downloadQueue.currentFileIndex,
    hasFiles,
    t,
  ]);

  const downloadButtonIcon = useMemo(() => {
    return isDownloading ? faXmark : faCloudArrowDown;
  }, [isDownloading]);

  const downloadButtonProgress = useMemo(() => {
    return isDownloading ? downloadQueue.overallProgress : undefined;
  }, [isDownloading, downloadQueue.overallProgress]);

  const downloadButtonStyle = useMemo(() => {
    return {
      backgroundColor: isDownloading
        ? palettes.danger[600]
        : palettes.primary[400],
      borderColor: isDownloading ? palettes.danger[600] : palettes.primary[400],
    };
  }, [isDownloading, palettes]);

  // Sorting functions
  const sortByDownloadStatus = useCallback(
    (files: (CourseDirectory | CourseFileOverview)[]) => {
      return files.sort((a, b) => {
        const aKey = `${BASE_PATH}/courses/${courseId}/files/${a.id}:${[
          courseFilesCache,
          (a as any).location?.substring(1),
          [
            a.name.split('.')[0] ? `${a.name.split('.')[0]} (${a.id})` : a.id,
            a.name.split('.').pop(),
          ]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/')}`;
        const bKey = `${BASE_PATH}/courses/${courseId}/files/${b.id}:${[
          courseFilesCache,
          (b as any).location?.substring(1),
          [
            b.name.split('.')[0] ? `${b.name.split('.')[0]} (${b.id})` : b.id,
            b.name.split('.').pop(),
          ]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/')}`;
        const aDownloaded = downloads[aKey]?.isDownloaded ?? false;
        const bDownloaded = downloads[bKey]?.isDownloaded ?? false;
        return bDownloaded ? 1 : aDownloaded ? -1 : 0;
      });
    },
    [courseId, courseFilesCache, downloads],
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

  // Multi-select functions
  const selectAllFiles = useCallback(async () => {
    if (!sortedData) return;

    const allFiles: Array<{ id: string; name: string; location?: string }> = [];

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
          });
        });
      } else {
        allFiles.push({
          id: item.id,
          name: item.name,
          location: (item as any).location,
        });
      }
    });

    const fileChecks = await Promise.all(
      allFiles.map(async file => {
        const [filename, extension] = splitNameAndExtension(file.name);
        const cachedFilePath = [
          courseFilesCache,
          file.location?.substring(1),
          [filename ? `${filename} (${file.id})` : file.id, extension]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/');

        const fileExists = await exists(cachedFilePath);
        return { file, fileExists };
      }),
    );

    const filesToAdd = fileChecks
      .filter(({ fileExists }) => !fileExists)
      .map(({ file }) => {
        const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${file.id}`;
        const [filename, extension] = splitNameAndExtension(file.name);
        const cachedFilePath = [
          courseFilesCache,
          file.location?.substring(1),
          [filename ? `${filename} (${file.id})` : file.id, extension]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/');

        return {
          id: file.id,
          name: file.name,
          url: fileUrl,
          filePath: cachedFilePath,
        };
      });

    if (filesToAdd.length > 0) {
      addFiles(filesToAdd);
      setAllFilesSelectedState(true);
    } else {
      setAllFilesSelectedState(true);
    }
  }, [sortedData, addFiles, courseId, courseFilesCache, isDirectoryView]);

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

  // Sort handler
  const onPressSortOption = useCallback(
    (event: string) => {
      setActiveSort(event);
      if (!data) return;

      if (isDirectoryView) {
        const directories = data.filter(item => isDirectory(item as any));
        const files = data.filter(item => !isDirectory(item as any));
        let sortedDirectories = directories;
        let sortedFiles = files;

        switch (event) {
          case sortOptions[0].id:
            sortedDirectories = sortByNameAsc(directories);
            sortedFiles = sortByNameAsc(files);
            break;
          case sortOptions[1].id:
            sortedDirectories = sortByNameDesc(directories);
            sortedFiles = sortByNameDesc(files);
            break;
          case sortOptions[2].id:
            sortedDirectories = sortByNameAsc(directories);
            sortedFiles = sortByDownloadStatus(files);
            break;
          case sortOptions[3].id:
            sortedDirectories = sortByNameAsc(directories);
            sortedFiles = sortByDate(files, false);
            break;
          case sortOptions[4].id:
            sortedDirectories = sortByNameAsc(directories);
            sortedFiles = sortByDate(files, true);
            break;
          default:
            break;
        }

        setSortedData([...sortedDirectories, ...sortedFiles]);
      } else {
        let sortedFiles = data;

        switch (event) {
          case sortOptions[0].id:
            sortedFiles = sortByNameAsc(data);
            break;
          case sortOptions[1].id:
            sortedFiles = sortByNameDesc(data);
            break;
          case sortOptions[2].id:
            sortedFiles = sortByDownloadStatus(data);
            break;
          case sortOptions[3].id:
            sortedFiles = sortByDate(data, false);
            break;
          case sortOptions[4].id:
            sortedFiles = sortByDate(data, true);
            break;
          default:
            break;
        }

        setSortedData(sortedFiles);
      }
    },
    [data, isDirectoryView, sortOptions, sortByDownloadStatus, sortByDate],
  );

  // Download handler
  const handleDownloadAction = useCallback(() => {
    if (isDownloading) {
      stopDownload();
    } else if (hasFiles) {
      startDownload();
    }
  }, [isDownloading, hasFiles, stopDownload, startDownload]);

  // Effects
  useEffect(() => {
    if (isDownloading) {
      setWasDownloading(true);
    } else if (wasDownloading && !isDownloading && enableMultiSelect) {
      setEnableMultiSelect(false);
      setWasDownloading(false);
    }
  }, [isDownloading, wasDownloading, enableMultiSelect]);

  return {
    // State
    enableMultiSelect,
    allFilesSelected,
    sortedData,
    setSortedData,
    activeSort,
    sortOptions,

    // Actions
    toggleMultiSelect,
    toggleSelectAll,
    onPressSortOption,
    handleDownloadAction,

    // Download button props
    downloadButtonTitle,
    downloadButtonIcon,
    downloadButtonProgress,
    downloadButtonStyle,
  };
};
