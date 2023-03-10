import { useContext, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import { extension } from 'react-native-mime-types';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  faCloudArrowDown,
  faEllipsisVertical,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Swipeable } from '@kyupss/native-swipeable';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IconButton } from '@lib/ui/components/IconButton';
import { SwipeableAction } from '@lib/ui/components/SwipeableAction';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { BASE_PATH, CourseFileOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { useDownload } from '../../../core/hooks/useDownload';
import { formatDateTime } from '../../../utils/dates';
import { formatFileSize } from '../../../utils/files';
import { notNullish } from '../../../utils/predicates';
import { CourseContext } from '../contexts/CourseContext';
import { UnsupportedFileTypeError } from '../errors/UnsupportedFileTypeError';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

export type CourseRecentFile = CourseFileOverview & {
  location?: string;
};

export interface Props {
  item: CourseRecentFile;
  showSize?: boolean;
  showLocation?: boolean;
  showCreatedDate?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export const CourseFileListItem = ({
  item,
  showSize = true,
  showLocation = false,
  showCreatedDate = true,
  onSwipeStart,
  onSwipeEnd,
  ...rest
}: Props) => {
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  // @ts-expect-error due to Swipeable lib type patch
  const swipeableRef = useRef<Swipeable>();
  const iconProps = useMemo(
    () => ({
      color: colors.secondaryText,
      size: fontSizes.xl,
    }),
    [colors, fontSizes, spacing],
  );
  const courseId = useContext(CourseContext);
  const courseFilesCache = useCourseFilesCachePath();
  const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${item.id}`;
  const cachedFilePath = useMemo(() => {
    if (courseFilesCache) {
      let ext = extension(item.mimeType);
      if (!ext) {
        ext = item.name.match(/\.(.+)$/)?.[1];
      }
      return [
        courseFilesCache,
        [item.id, ext].filter(notNullish).join('.'),
      ].join('/');
    }
  }, [courseFilesCache, item]);
  const {
    isDownloaded,
    downloadProgress,
    startDownload,
    stopDownload,
    refreshDownload,
    removeDownload,
    openFile,
  } = useDownload(fileUrl, cachedFilePath);

  const metrics = useMemo(
    () =>
      [
        showSize && formatFileSize(item.sizeInKiloBytes),
        showLocation && item.location,
        showCreatedDate && formatDateTime(item.createdAt),
      ]
        .filter(i => !!i)
        .join(' - '),
    [showSize, showLocation, showCreatedDate],
  );

  const trailingItem = useMemo(
    () =>
      !isDownloaded ? (
        downloadProgress == null ? (
          <IconButton
            icon={faCloudArrowDown}
            accessibilityLabel={t('common.download')}
            disabled
            adjustSpacing="right"
            {...iconProps}
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
          />
        )
      ) : (
        Platform.select({
          android: (
            <MenuView
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
                    refreshDownload();
                    break;
                  case 'delete':
                    removeDownload();
                    break;
                  default:
                }
              }}
            >
              <IconButton
                icon={faEllipsisVertical}
                accessibilityLabel={t('common.options')}
                adjustSpacing="right"
                {...iconProps}
              />
            </MenuView>
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
      onPress={async () => {
        if (downloadProgress == null) {
          if (!isDownloaded) {
            await startDownload();
          }
          openDownloadedFile();
        }
      }}
      isDownloaded={isDownloaded}
      downloadProgress={downloadProgress}
      title={item.name}
      subtitle={metrics}
      trailingItem={trailingItem}
      mimeType={item.mimeType}
      {...rest}
    />
  );

  if (Platform.OS === 'ios' && isDownloaded) {
    return (
      <Swipeable
        onRef={ref => (swipeableRef.current = ref)}
        rightContainerStyle={{ backgroundColor: colors.danger[500] }}
        rightButtons={[
          <SwipeableAction
            icon={faCloudArrowDown}
            label={t('common.refresh')}
            backgroundColor={colors.primary[500]}
            onPress={async () => {
              swipeableRef.current?.recenter();
              await refreshDownload();
              openDownloadedFile();
            }}
          />,
          <SwipeableAction
            icon={faTrashCan}
            label={t('common.remove')}
            backgroundColor={colors.danger[500]}
            onPress={() => {
              swipeableRef.current?.recenter();
              removeDownload();
            }}
          />,
        ]}
        onSwipeStart={() => onSwipeStart?.()}
        onSwipeComplete={() => onSwipeEnd?.()}
      >
        {listItem}
      </Swipeable>
    );
  }
  return listItem;
};
