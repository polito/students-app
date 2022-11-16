import { useContext, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { open } from 'react-native-file-viewer';
import { CachesDirectoryPath } from 'react-native-fs';
import { extension } from 'react-native-mime-types';

import {
  faCloudArrowDown,
  faEllipsisVertical,
  faTrashCan,
  faXmark,
} from '@fortawesome/pro-regular-svg-icons';
import { Swipeable } from '@kyupss/native-swipeable';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IconButton } from '@lib/ui/components/IconButton';
import { SwipeableAction } from '@lib/ui/components/SwipeableAction';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseFileOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { useDownload } from '../../../core/hooks/useDownload';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { formatFileDate, formatFileSize } from '../../../utils/files';
import { CourseContext } from '../contexts/CourseContext';

export type CourseRecentFile = CourseFileOverview & {
  location?: string;
};

export interface Props {
  item: CourseRecentFile;
  showSize?: boolean;
  showLocation?: boolean;
  showCreatedDate?: boolean;
}

export const CourseFileListItem = ({
  item,
  showSize = true,
  showLocation = false,
  showCreatedDate = true,
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
  const { data: student } = useGetStudent();
  const courseId = useContext(CourseContext);
  const cachedFilePath = useMemo(() => {
    if (student) {
      return [
        CachesDirectoryPath,
        student.data.username,
        'Courses',
        courseId,
        `${item.id}.${extension(item.mimeType)}`,
      ].join('/');
    }
  }, [student]);
  const { isDownloaded, downloadProgress, start, stop, refresh, remove } =
    useDownload(
      'https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf',
      cachedFilePath,
    );
  // 'https://cartographicperspectives.org/index.php/journal/article/download/cp43-complete-issue/pdf/2712',

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

  const trailingItem = !isDownloaded ? (
    downloadProgress == null ? (
      <IconButton
        icon={faCloudArrowDown}
        accessibilityLabel={t('words.download')}
        disabled
        adjustSpacing="right"
        {...iconProps}
      />
    ) : (
      <IconButton
        icon={faXmark}
        accessibilityLabel={t('words.stop')}
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
          shouldOpenOnLongPress={true}
          title={t('words.file')}
          actions={[
            {
              id: 'refresh',
              title: t('words.refresh'),
            },
            {
              id: 'delete',
              title: t('words.delete'),
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
            accessibilityLabel={t('words.options')}
            adjustSpacing="right"
            {...iconProps}
          />
        </MenuView>
      ),
    })
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
            label={t('words.refresh')}
            backgroundColor={colors.muted[500]}
            onPress={() => {
              swipeableRef.current?.recenter();
              refresh();
            }}
          />,
          <SwipeableAction
            icon={faTrashCan}
            label={t('words.remove')}
            backgroundColor={colors.danger[500]}
            onPress={() => {
              swipeableRef.current?.recenter();
              remove();
            }}
          />,
        ]}
      >
        {listItem}
      </Swipeable>
    );
  }
  return listItem;
};
