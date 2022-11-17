import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { open } from 'react-native-file-viewer';
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
import { CourseFileOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';
import { useFocusEffect } from '@react-navigation/native';

import { useDownload } from '../../../core/hooks/useDownload';
import { formatFileDate, formatFileSize } from '../../../utils/files';
import { useCourseFilesCache } from '../hooks/useCourseFilesCache';

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
  const courseFilesCache = useCourseFilesCache();
  const cachedFilePath = useMemo(() => {
    if (courseFilesCache) {
      return [courseFilesCache, `${item.id}.${extension(item.mimeType)}`].join(
        '/',
      );
    }
  }, [courseFilesCache, item]);
  const {
    isDownloaded,
    downloadProgress,
    start,
    stop,
    refresh,
    remove,
    notifyFileSystemChange,
  } = useDownload(
    'https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf',
    // 'https://cartographicperspectives.org/index.php/journal/article/download/cp43-complete-issue/pdf/2712',
    // 'https://www.africau.edu/images/default/sample.pdf',
    cachedFilePath,
  );

  useFocusEffect(
    useCallback(() => {
      // Refresh the current item on screen focus
      notifyFileSystemChange();
    }, []),
  );

  const metrics = useMemo(
    () =>
      [
        showSize && formatFileSize(item.sizeInKiloBytes),
        showLocation && item.location,
        showCreatedDate && formatFileDate(item.createdAt),
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
              stop();
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
                    refresh();
                    break;
                  case 'delete':
                    remove();
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

  const listItem = (
    <FileListItem
      onPress={async () => {
        if (downloadProgress == null) {
          if (!isDownloaded) {
            await start();
          }
          open(cachedFilePath);
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
            onPress={() => {
              swipeableRef.current?.recenter();
              refresh();
            }}
          />,
          <SwipeableAction
            icon={faTrashCan}
            label={t('common.remove')}
            backgroundColor={colors.danger[500]}
            onPress={() => {
              swipeableRef.current?.recenter();
              remove();
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
