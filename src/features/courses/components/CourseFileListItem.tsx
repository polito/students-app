import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import ContextMenu, { ContextMenuProps } from 'react-native-context-menu-view';

import {
  faCloudArrowDown,
  faEllipsisVertical,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItemProps } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseFileOverview } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';

import { Checkbox } from '~/core/components/Checkbox';

import { useFeedbackContext } from '../../../../src/core/contexts/FeedbackContext';
import { IS_ANDROID, IS_IOS } from '../../../core/constants';
import {
  DownloadContext,
  useDownloadsContext,
} from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useDownloadFile } from '../../../core/hooks/useDownloadFile';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useGetCourse } from '../../../core/queries/courseHooks';
import { formatDateTime } from '../../../utils/dates';
import {
  buildCourseFileUrl,
  formatFileSize,
  stripIdInParentheses,
} from '../../../utils/files';
import { useCourseContext } from '../contexts/CourseContext';
import { UnsupportedFileTypeError } from '../errors/UnsupportedFileTypeError';

export type CourseRecentFile = CourseFileOverview & {
  location?: string;
};

export interface Props extends Partial<ListItemProps> {
  item: CourseRecentFile;
  showSize?: boolean;
  showLocation?: boolean;
  showCreatedDate?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  enableMultiSelect?: boolean;
  onCheckComplete?: () => void;
  disabled?: boolean;
}

interface MenuProps extends Partial<ContextMenuProps> {
  onRefreshDownload: () => void;
  onRemoveDownload: () => void;
  isDownloaded: boolean;
}

const Menu = ({
  children,
  onRefreshDownload,
  onRemoveDownload,
  isDownloaded,
}: MenuProps) => {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();

  return (
    <ContextMenu
      dropdownMenuMode={IS_ANDROID}
      title={t('common.file')}
      actions={[
        {
          title: t('common.refresh'),
          titleColor: dark ? colors.white : colors.black,
        },
        {
          title: t('common.delete'),
          titleColor: dark ? colors.white : colors.black,
          destructive: true,
        },
      ]}
      onPress={({ nativeEvent: { index } }) => {
        switch (index) {
          case 0:
            onRefreshDownload();
            break;
          case 1:
            onRemoveDownload();
            break;
          default:
        }
      }}
      disabled={IS_IOS && !isDownloaded}
    >
      {children}
    </ContextMenu>
  );
};

export const CourseFileListItem = memo(
  ({
    item,
    showSize = true,
    showLocation = false,
    showCreatedDate = true,
    enableMultiSelect,
    onCheckComplete,
    disabled,
    ...rest
  }: Props) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { colors, fontSizes, spacing } = useTheme();
    const iconProps = useMemo(
      () => ({
        color: colors.secondaryText,
        size: fontSizes.xl,
      }),
      [colors, fontSizes],
    );
    const courseId = useCourseContext();
    const { data: course } = useGetCourse(courseId);
    const { setFeedback } = useFeedbackContext();
    const { fileStorageLocation, customStorageDisplayPath } =
      usePreferencesContext();
    const { getUnreadsCount } = useNotifications();
    const {
      getCourseFilePath,
      getFileSizeInStorage,
      downloadQueue,
      addFilesToQueue,
      removeFilesFromQueue,
    } = useDownloadsContext();
    const fileNotificationScope = useMemo(
      () => ['teaching', 'courses', `${courseId}`, 'files', item.id] as const,
      [courseId, item.id],
    );
    const [isCorrupted, setIsCorrupted] = useState(false);
    const isInQueue = useMemo(
      () => downloadQueue.files.some(f => f.id === item.id),
      [downloadQueue.files, item.id],
    );
    const fileUrl = useMemo(
      () => buildCourseFileUrl(courseId, item.id),
      [courseId, item.id],
    );
    const cachedFilePath = useMemo(
      () =>
        getCourseFilePath({
          courseId,
          courseName: course?.name,
          location: item.location,
          fileId: item.id,
          fileName: item.name ?? '',
          mimeType: item.mimeType,
        }),
      [
        getCourseFilePath,
        courseId,
        course?.name,
        item.location,
        item.id,
        item.name,
        item.mimeType,
      ],
    );

    const {
      isDownloaded,
      isCheckingDownloadStatus,
      downloadProgress,
      startDownload,
      stopDownload,
      refreshDownload,
      removeDownload,
      openFile,
    } = useDownloadFile(
      fileUrl,
      cachedFilePath,
      item.id,
      DownloadContext.Course,
      courseId.toString(),
    );

    useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!isDownloaded) {
          if (!cancelled) setIsCorrupted(false);
          return;
        }
        try {
          const fileSize = await getFileSizeInStorage(cachedFilePath);
          if (fileSize == null || cancelled) {
            if (!cancelled) setIsCorrupted(false);
            return;
          }
          const expectedSize = item.sizeInKiloBytes * 1024;
          const sizeMismatch =
            Math.abs(fileSize - expectedSize) /
              Math.max(fileSize, expectedSize) >
            0.1;
          if (!cancelled) setIsCorrupted(sizeMismatch);
        } catch {
          if (!cancelled) setIsCorrupted(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [
      cachedFilePath,
      isDownloaded,
      item.sizeInKiloBytes,
      getFileSizeInStorage,
    ]);

    useEffect(() => {
      if (!isCheckingDownloadStatus) {
        onCheckComplete?.();
      }
    }, [isCheckingDownloadStatus, onCheckComplete]);

    const metrics = useMemo(
      () =>
        [
          showCreatedDate && item.createdAt && formatDateTime(item.createdAt),
          showSize &&
            item.sizeInKiloBytes &&
            formatFileSize(item.sizeInKiloBytes),
          showLocation && item.location,
        ]
          .filter(i => !!i)
          .join(' - '),
      [showCreatedDate, item, showSize, showLocation],
    );

    const openDownloadedFile = useCallback(
      async (force = false) => {
        if (!force && !isDownloaded) {
          return;
        }
        if (Platform.OS === 'android' && force) {
          const savedPath =
            fileStorageLocation === 'custom' && customStorageDisplayPath
              ? customStorageDisplayPath
              : cachedFilePath;
          setFeedback({
            text: `${t('courseFileListItem.fileSavedPrefix')} ${savedPath}`,
            isPersistent: false,
          });
        }
        openFile().catch(e => {
          if (e instanceof UnsupportedFileTypeError) {
            Alert.alert(
              t('common.error'),
              t('courseFileListItem.openFileError'),
            );
          }
        });
      },
      [
        openFile,
        t,
        cachedFilePath,
        setFeedback,
        isDownloaded,
        fileStorageLocation,
        customStorageDisplayPath,
      ],
    );

    const downloadFile = useCallback(async () => {
      if (downloadProgress == null) {
        if (isCorrupted) {
          await refreshDownload();
          return;
        }
        if (!isDownloaded) {
          const downloadSuccess = await startDownload();
          if (downloadSuccess && navigation.isFocused()) {
            openDownloadedFile(true);
          }
        } else if (navigation.isFocused()) {
          openDownloadedFile();
        }
      }
    }, [
      downloadProgress,
      isCorrupted,
      isDownloaded,
      navigation,
      openDownloadedFile,
      refreshDownload,
      startDownload,
    ]);

    const handleToggleQueue = useCallback(() => {
      if (isInQueue) {
        removeFilesFromQueue([item.id]);
      } else {
        addFilesToQueue(
          [
            {
              id: item.id,
              name: item.name,
              url: fileUrl,
              filePath: cachedFilePath,
              sizeInKiloBytes: item.sizeInKiloBytes,
            },
          ],
          courseId,
          DownloadContext.Course,
        );
      }
    }, [
      isInQueue,
      item.id,
      item.name,
      fileUrl,
      cachedFilePath,
      courseId,
      removeFilesFromQueue,
      addFilesToQueue,
      item.sizeInKiloBytes,
    ]);

    const trailingItem = useMemo(
      () =>
        enableMultiSelect ? (
          <Checkbox
            isChecked={isInQueue}
            onPress={handleToggleQueue}
            textStyle={{ marginHorizontal: 0 }}
            containerStyle={{ marginHorizontal: 0, marginVertical: 0 }}
          />
        ) : !isDownloaded || isCheckingDownloadStatus ? (
          downloadProgress == null ? (
            <IconButton
              icon={faCloudArrowDown}
              accessibilityLabel={t('common.download')}
              adjustSpacing="right"
              onPress={downloadFile}
              {...iconProps}
              hitSlop={{
                left: +spacing[2],
                right: +spacing[2],
              }}
            />
          ) : (
            <IconButton
              icon={faXmark}
              accessibilityLabel={t('common.stop')}
              adjustSpacing="right"
              onPress={stopDownload}
              {...iconProps}
              hitSlop={{
                left: +spacing[2],
                right: +spacing[2],
              }}
            />
          )
        ) : (
          Platform.select({
            android: (
              <Menu
                onRefreshDownload={refreshDownload}
                onRemoveDownload={removeDownload}
                isDownloaded={isDownloaded}
              >
                <IconButton
                  icon={faEllipsisVertical}
                  accessibilityLabel={t('common.options')}
                  adjustSpacing="right"
                  {...iconProps}
                />
              </Menu>
            ),
          })
        ),
      [
        enableMultiSelect,
        isInQueue,
        handleToggleQueue,
        isCheckingDownloadStatus,
        isDownloaded,
        downloadProgress,
        t,
        downloadFile,
        iconProps,
        spacing,
        stopDownload,
        refreshDownload,
        removeDownload,
      ],
    );

    const listItem = (
      <FileListItem
        {...rest}
        disabled={disabled}
        accessibilityLabel={
          !isDownloaded
            ? downloadProgress == null
              ? t('common.download')
              : t('common.stop')
            : t('common.open')
        }
        onPress={!enableMultiSelect ? downloadFile : handleToggleQueue}
        isDownloaded={isDownloaded}
        downloadProgress={downloadProgress}
        title={stripIdInParentheses(item.name ?? '') || t('common.unnamedFile')}
        subtitle={metrics}
        trailingItem={trailingItem}
        mimeType={item.mimeType}
        unread={!!getUnreadsCount(fileNotificationScope)}
        isCorrupted={isCorrupted}
      />
    );

    if (IS_IOS) {
      return (
        <Menu
          onRefreshDownload={refreshDownload}
          onRemoveDownload={removeDownload}
          isDownloaded={isDownloaded}
        >
          {listItem}
        </Menu>
      );
    }

    return listItem;
  },
);
