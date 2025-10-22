import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import ContextMenu, { ContextMenuProps } from 'react-native-context-menu-view';
import { stat } from 'react-native-fs';
import { extension, lookup } from 'react-native-mime-types';

import {
  faCloudArrowDown,
  faEllipsisVertical,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItemProps } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { BASE_PATH, CourseFileOverview } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';

import { Checkbox } from '~/core/components/Checkbox';

import { useFeedbackContext } from '../../../../src/core/contexts/FeedbackContext';
import { IS_ANDROID, IS_IOS } from '../../../core/constants';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { useDownloadCourseFile } from '../../../core/hooks/useDownloadCourseFile';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { formatDateTime } from '../../../utils/dates';
import { formatFileSize, splitNameAndExtension } from '../../../utils/files';
import { notNullish } from '../../../utils/predicates';
import { useCourseContext } from '../contexts/CourseContext';
import { UnsupportedFileTypeError } from '../errors/UnsupportedFileTypeError';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

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
    const [courseFilesCache] = useCourseFilesCachePath();
    const { setFeedback } = useFeedbackContext();
    const { getUnreadsCount } = useNotifications();
    const fileNotificationScope = useMemo(
      () => ['teaching', 'courses', courseId.toString(), 'files', item.id],
      [courseId, item.id],
    );
    const [isCorrupted, setIsCorrupted] = useState(false);
    const { downloadQueue, addFilesToQueue, removeFilesFromQueue } =
      useDownloadsContext();
    const isInQueue = downloadQueue.files.some(f => f.id === item.id);
    const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${item.id}`;
    const cachedFilePath = useMemo(() => {
      let ext: string | null = extension(item.mimeType!);
      const [filename, extensionFromName] = splitNameAndExtension(item.name);
      if (!ext && extensionFromName && lookup(extensionFromName)) {
        ext = extensionFromName;
      }
      return [
        courseFilesCache,
        item.location?.substring(1),
        [filename ? `${filename} (${item.id})` : item.id, ext]
          .filter(notNullish)
          .join('.'),
      ]
        .filter(Boolean)
        .join('/');
    }, [courseFilesCache, item]);

    const {
      isDownloaded,
      downloadProgress,
      startDownload,
      stopDownload,
      refreshDownload,
      removeDownload,
      openFile,
    } = useDownloadCourseFile(fileUrl, cachedFilePath, item.id);

    useEffect(() => {
      (async () => {
        if (!isDownloaded) {
          setIsCorrupted(false);
          return;
        }
        const fileStats = await stat(cachedFilePath);
        setIsCorrupted(
          Math.abs(fileStats.size - item.sizeInKiloBytes * 1024) /
            Math.max(fileStats.size, item.sizeInKiloBytes * 1024) >
            0.1,
        );
      })();
    }, [cachedFilePath, isDownloaded, item.sizeInKiloBytes]);

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

    const openDownloadedFile = useCallback(async () => {
      if (Platform.OS === 'android') {
        if (!isDownloaded)
          setFeedback({
            text:
              Platform.Version > 29
                ? t('courseFileListItem.fileSavedDocumentsPath')
                : t('courseFileListItem.fileSaved', {
                    cachedFilePath: cachedFilePath,
                  }),
            isPersistent: false,
          });
      }
      openFile().catch(e => {
        if (e instanceof UnsupportedFileTypeError) {
          Alert.alert(t('common.error'), t('courseFileListItem.openFileError'));
        }
      });
    }, [openFile, t, cachedFilePath, setFeedback, isDownloaded]);

    const downloadFile = useCallback(async () => {
      if (downloadProgress == null) {
        if (isCorrupted) {
          await refreshDownload();
          return;
        }
        if (!isDownloaded) {
          await startDownload();
        }
        if (navigation.isFocused()) {
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

    const trailingItem = useMemo(
      () =>
        !isDownloaded ? (
          downloadProgress == null ? (
            enableMultiSelect === false ? (
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
              <Checkbox
                isChecked={isInQueue}
                onPress={() => {
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
                        },
                      ],
                      courseId,
                      'course',
                    );
                  }
                }}
                textStyle={{ marginHorizontal: 0 }}
                containerStyle={{ marginHorizontal: 0, marginVertical: 0 }}
              ></Checkbox>
            )
          ) : (
            <IconButton
              icon={faXmark}
              accessibilityLabel={t('common.stop')}
              adjustSpacing="right"
              onPress={() => {
                stopDownload();
              }}
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
        isDownloaded,
        downloadProgress,
        t,
        downloadFile,
        iconProps,
        spacing,
        refreshDownload,
        removeDownload,
        stopDownload,
        enableMultiSelect,
        isInQueue,
        addFilesToQueue,
        removeFilesFromQueue,
        item.id,
        item.name,
        fileUrl,
        cachedFilePath,
        courseId,
      ],
    );

    const listItem = (
      <FileListItem
        {...rest}
        accessibilityLabel={
          !isDownloaded
            ? downloadProgress == null
              ? t('common.download')
              : t('common.stop')
            : t('common.open')
        }
        onPress={
          !enableMultiSelect
            ? () => {
                downloadFile();
              }
            : () => {
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
                      },
                    ],
                    courseId,
                    'course',
                  );
                }
              }
        }
        isDownloaded={isDownloaded}
        downloadProgress={downloadProgress}
        title={item.name ?? t('common.unnamedFile')}
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
