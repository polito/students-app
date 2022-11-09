import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { open } from 'react-native-file-viewer';
import {
  CachesDirectoryPath,
  downloadFile,
  exists,
  mkdir,
  unlink,
} from 'react-native-fs';
import { extension } from 'react-native-mime-types';
import useStateRef from 'react-usestateref';

import { FileListItem } from '@lib/ui/components/FileListItem';
import { CourseFileOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { useGetStudent } from '../../../core/queries/studentHooks';
import { formatFileDate, formatFileSize } from '../../../utils/files';

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
  const { data: student } = useGetStudent();
  const [isDownloaded, setIsDownloaded, isDownloadedRef] = useStateRef(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(null);
  const courseCachePath = useMemo(() => {
    if (student) {
      return [CachesDirectoryPath, student.data.username, 'course-files'].join(
        '/',
      );
    }
  }, [student]);
  const cachedFilePath = useMemo(() => {
    if (courseCachePath) {
      return [courseCachePath, `${item.id}.${extension(item.mimeType)}`].join(
        '/',
      );
    }
  }, [courseCachePath]);

  useEffect(() => {
    if (cachedFilePath) {
      exists(cachedFilePath).then(result => {
        setIsDownloaded(result);
      });
    }
  }, [cachedFilePath]);

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

  const downloadOrOpenFile = async () => {
    if (!isDownloadedRef.current && downloadProgress == null) {
      setDownloadProgress(0);
      try {
        await mkdir(courseCachePath, {
          NSURLIsExcludedFromBackupKey: true,
        });
        await downloadFile({
          fromUrl: 'https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf',
          // 'https://cartographicperspectives.org/index.php/journal/article/download/cp43-complete-issue/pdf/2712',
          toFile: cachedFilePath,
          progressInterval: 200,
          begin: () => {
            /* Necessary for progress to work */
          },
          progress: ({ bytesWritten, contentLength }) =>
            setDownloadProgress(bytesWritten / contentLength),
        }).promise;
        setIsDownloaded(true);
        setDownloadProgress(null);
        open(cachedFilePath);
      } catch (e) {
        // TODO show error message
      }
    } else {
      open(cachedFilePath);
    }
  };

  return (
    <MenuView
      shouldOpenOnLongPress={true}
      title={t('words.file')}
      actions={[
        {
          id: 'redownload',
          title: t('courseFileListItem.reDownloadFile'),
          image: 'arrow.down.circle',
        },
      ]}
      onPressAction={async ({ nativeEvent }) => {
        switch (nativeEvent.event) {
          case 'redownload':
            if (downloadProgress == null) {
              await unlink(cachedFilePath);
              setIsDownloaded(false);
              setTimeout(downloadOrOpenFile, 1000);
            }
            break;
          default:
        }
      }}
    >
      <FileListItem
        onPress={downloadOrOpenFile}
        isDownloaded={isDownloaded}
        downloadProgress={downloadProgress}
        title={item.name}
        subtitle={metrics}
        {...rest}
      />
    </MenuView>
  );
};
