import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { unlink } from 'react-native-fs';

import {
  faCloudArrowDown,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';

import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useGenericDownload } from '../../../core/hooks/useDownloadQueue';
import { getFileKey } from '../../../core/providers/downloads/downloadsFileUtils';
import { buildCourseFilePath, buildCourseFileUrl } from '../../../utils/files';
import { sortByNameAsc, sortByNameDesc } from '../../../utils/sorting';
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
  const { palettes, spacing } = useTheme();
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
  const { updateDownload } = useDownloadsContext();
  const fileDatabase = getFileDatabase();

  const [enableMultiSelect, setEnableMultiSelect] = useState(false);
  const [allFilesSelectedState, setAllFilesSelectedState] = useState(false);
  const [sortedData, setSortedData] = useState<typeof data>(undefined);
  const [wasDownloading, setWasDownloading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

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

  const downloadButtonStyle = useMemo(() => {
    return {
      backgroundColor: isDownloading
        ? palettes.danger[600]
        : palettes.primary[400],
      borderColor: isDownloading ? palettes.danger[600] : palettes.primary[400],
    };
  }, [isDownloading, palettes]);

  const selectedDownloadedFiles = useMemo(() => {
    if (!isDownloading && courseFiles.length === 0) return [];
    return courseFiles.filter(file => {
      const key = getFileKey(file);
      return downloads[key]?.isDownloaded === true;
    });
  }, [courseFiles, downloads, isDownloading]);

  const selectedNotDownloadedFiles = useMemo(() => {
    if (!isDownloading && courseFiles.length === 0) return [];
    return courseFiles.filter(file => {
      const key = getFileKey(file);
      return downloads[key]?.isDownloaded !== true;
    });
  }, [courseFiles, downloads, isDownloading]);

  const downloadButtonTitle = useMemo(() => {
    if (isDownloading) {
      return t('common.downloadProgress', {
        current: downloadQueue.currentFileIndex,
        total: courseFiles.length,
      });
    }
    const notDownloadedCount = selectedNotDownloadedFiles.length;
    return notDownloadedCount > 0
      ? `${t('common.download')} (${notDownloadedCount})`
      : t('common.download');
  }, [
    isDownloading,
    downloadQueue.currentFileIndex,
    courseFiles.length,
    selectedNotDownloadedFiles.length,
    t,
  ]);

  const hasDownloadedFiles = selectedDownloadedFiles.length > 0;
  const hasNotDownloadedFiles = selectedNotDownloadedFiles.length > 0;

  const removeButtonTitle = useMemo(() => {
    return hasDownloadedFiles
      ? `${t('common.remove')} (${selectedDownloadedFiles.length})`
      : t('common.remove');
  }, [hasDownloadedFiles, selectedDownloadedFiles.length, t]);

  const removeButtonStyle = useMemo(() => {
    return {
      backgroundColor: palettes.danger[600],
      borderColor: palettes.danger[600],
      marginBottom: spacing[16],
    };
  }, [palettes, spacing]);

  const isDownloadButtonDisabled = useMemo(() => {
    return !hasNotDownloadedFiles && !isDownloading;
  }, [hasNotDownloadedFiles, isDownloading]);

  const isRemoveButtonDisabled = useMemo(() => {
    return !hasDownloadedFiles;
  }, [hasDownloadedFiles]);

  const sortByDownloadStatus = useCallback(
    (files: (CourseDirectory | CourseFileOverview)[]) => {
      if (!downloads || Object.keys(downloads).length === 0) {
        return files;
      }
      return files.sort((a, b) => {
        const aFilePath = buildCourseFilePath(
          courseFilesCache,
          (a as any).location,
          a.id,
          a.name,
          (a as any).mimeType,
        );
        const aKey = `${buildCourseFileUrl(courseId, a.id)}:${aFilePath}`;

        const bFilePath = buildCourseFilePath(
          courseFilesCache,
          (b as any).location,
          b.id,
          b.name,
          (b as any).mimeType,
        );
        const bKey = `${buildCourseFileUrl(courseId, b.id)}:${bFilePath}`;

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

    const filesToAdd = allFiles.map(file => {
      const fileUrl = buildCourseFileUrl(courseId, file.id);
      const cachedFilePath = buildCourseFilePath(
        courseFilesCache,
        file.location,
        file.id,
        file.name,
      );

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

  const handleDownloadAction = useCallback(() => {
    if (isDownloading) {
      stopDownload();
    } else if (hasFiles) {
      startDownload();
    }
  }, [isDownloading, hasFiles, stopDownload, startDownload]);

  const handleRemoveAction = useCallback(() => {
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
          setIsRemoving(true);
          try {
            const removePromises = selectedDownloadedFiles.map(async file => {
              const key = getFileKey(file);
              const filePath = file.request.destination;

              try {
                await unlink(filePath);
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

            const fileIdsToRemove = selectedDownloadedFiles.map(
              file => file.id,
            );
            removeFiles(fileIdsToRemove);

            setEnableMultiSelect(false);
            clearFiles();
            setAllFilesSelectedState(false);
          } finally {
            setIsRemoving(false);
          }
        },
      },
    ]);
  }, [
    hasDownloadedFiles,
    selectedDownloadedFiles,
    t,
    fileDatabase,
    updateDownload,
    removeFiles,
    clearFiles,
  ]);

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

    downloadButtonTitle,
    downloadButtonIcon,
    downloadButtonProgress,
    downloadButtonStyle,
    isDownloadButtonDisabled,
    isDownloading,

    removeButtonTitle,
    removeButtonStyle,
    isRemoveButtonDisabled,

    renderCtaButtons,
  };
};
