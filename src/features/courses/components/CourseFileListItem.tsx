import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
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
import { MenuView } from '@react-native-menu/menu';
import { MenuComponentProps } from '@react-native-menu/menu/src/types';
import { useFocusEffect } from '@react-navigation/native';

import { IS_IOS } from '../../../core/constants';
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
}

interface MenuProps extends Partial<MenuComponentProps> {
  onRefreshDownload: () => void;
  onRemoveDownload: () => void;
}

const Menu = ({
  shouldOpenOnLongPress = false,
  children,
  onRefreshDownload,
  onRemoveDownload,
}: MenuProps) => {
  const { t } = useTranslation();
  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={t('common.file')}
      actions={[
        {
          id: 'refresh',
          title: t('common.refresh'),
        },
        {
          id: 'delete',
          title: t('common.delete'),
          attributes: {
            destructive: true,
          },
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        switch (nativeEvent.event) {
          case 'refresh':
            onRefreshDownload();
            break;
          case 'delete':
            onRemoveDownload();
            break;
          default:
        }
      }}
    >
      {children}
    </MenuView>
  );
};

export const CourseFileListItem = ({
  item,
  showSize = true,
  showLocation = false,
  showCreatedDate = true,
  isInVisibleRange = false,
  ...rest
}: Props) => {
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const iconProps = useMemo(
    () => ({
      color: colors.secondaryText,
      size: fontSizes.xl,
    }),
    [colors, fontSizes],
  );
  const [notificationClearRequested, setNotificationClearRequested] =
    useState(false);
  const courseId = useCourseContext();
  const courseFilesCache = useCourseFilesCachePath();
  const { getUnreadsCount, clearNotificationScope } = useNotifications();
  const fileNotificationScope = useMemo(
    () => ['teaching', 'courses', courseId.toString(), 'files', item.id],
    [courseId, item.id],
  );
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
    ].join('/');
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

  useFocusEffect(
    useCallback(() => {
      if (
        !notificationClearRequested &&
        isInVisibleRange &&
        clearNotificationScope &&
        fileNotificationScope
      ) {
        setNotificationClearRequested(true);
        clearNotificationScope(fileNotificationScope);
      }
    }, [
      notificationClearRequested,
      isInVisibleRange,
      clearNotificationScope,
      fileNotificationScope,
    ]),
  );

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

  const downloadFile = async () => {
    if (downloadProgress == null) {
      if (!isDownloaded) {
        await startDownload();
      }
      openDownloadedFile();
    }
  };

  const trailingItem = useMemo(
    () =>
      !isDownloaded ? (
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
    [isDownloaded, downloadProgress],
  );

  const openDownloadedFile = () => {
    openFile().catch(e => {
      if (e instanceof UnsupportedFileTypeError) {
        Alert.alert(t('common.error'), t('courseFileListItem.openFileError'));
      }
    });
  };

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
      onPress={downloadFile}
      isDownloaded={isDownloaded}
      downloadProgress={downloadProgress}
      title={item.name ?? t('common.unnamedFile')}
      subtitle={metrics}
      trailingItem={trailingItem}
      mimeType={item.mimeType}
      unread={!!getUnreadsCount(fileNotificationScope)}
    />
  );

  if (IS_IOS) {
    return (
      <Menu
        shouldOpenOnLongPress
        onRefreshDownload={refreshDownload}
        onRemoveDownload={removeDownload}
      >
        {listItem}
      </Menu>
    );
  }

  return listItem;
};
