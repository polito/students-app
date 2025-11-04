import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableHighlightProps } from 'react-native';
import { exists } from 'react-native-fs';
import { extension, lookup } from 'react-native-mime-types';

import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { BASE_PATH } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';

import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { splitNameAndExtension } from '../../../utils/files';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

const isFile = (item: {
  type: string;
}): item is { type: 'file' } & CourseFileOverview => item.type === 'file';

interface Props {
  courseId: number;
  item: CourseDirectory;
  enableMultiSelect?: boolean;
}

export const CourseDirectoryListItem = ({
  courseId,
  item,
  enableMultiSelect = false,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();
  const { t } = useTranslation();
  const { downloadQueue, addFilesToQueue, removeFilesFromQueue, downloads } =
    useDownloadsContext();
  const [courseFilesCache] = useCourseFilesCachePath();

  const isInQueue = useMemo(() => {
    const directoryFiles = item.files.filter(isFile);

    return directoryFiles.some(file =>
      downloadQueue.files.some(queuedFile => queuedFile.id === file.id),
    );
  }, [downloadQueue.files, item]);

  const [allFilesDownloaded, setAllFilesDownloaded] = useState(false);

  const checkAllFilesDownloaded = useCallback(async () => {
    const directoryFiles = item.files.filter(isFile);

    if (directoryFiles.length === 0) {
      setAllFilesDownloaded(false);
      return;
    }

    const fileChecks = await Promise.all(
      directoryFiles.map(async file => {
        const [filenameFromName, extensionFromName] = splitNameAndExtension(
          file.name,
        );
        let ext: string | null = extension(file.mimeType!);
        if (!ext && extensionFromName && lookup(extensionFromName)) {
          ext = extensionFromName;
        }

        const fileLocation = `/${item.name}`;
        const cachedFilePath = [
          courseFilesCache,
          fileLocation.substring(1),
          [filenameFromName ? `${filenameFromName} (${file.id})` : file.id, ext]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/');

        const fileExists = await exists(cachedFilePath);
        return fileExists;
      }),
    );

    const allDownloaded = fileChecks.every(fileExists => fileExists);
    setAllFilesDownloaded(allDownloaded);
  }, [item, courseFilesCache]);

  useEffect(() => {
    checkAllFilesDownloaded();
  }, [checkAllFilesDownloaded]);

  useEffect(() => {
    checkAllFilesDownloaded();
  }, [downloads, checkAllFilesDownloaded]);

  useEffect(() => {
    const handleFocus = () => {
      checkAllFilesDownloaded();
    };

    checkAllFilesDownloaded();

    const unsubscribe = navigation.addListener('focus', handleFocus);

    return unsubscribe;
  }, [navigation, checkAllFilesDownloaded]);

  const handleSelection = useCallback(() => {
    const directoryFiles = item.files.filter(isFile);

    if (isInQueue) {
      directoryFiles.forEach(file => {
        removeFilesFromQueue([file.id]);
      });
    } else {
      directoryFiles.forEach(file => {
        const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${file.id}`;

        let ext: string | null = extension(file.mimeType!);
        const [filenameFromName, extensionFromName] = splitNameAndExtension(
          file.name,
        );
        if (!ext && extensionFromName && lookup(extensionFromName)) {
          ext = extensionFromName;
        }

        const fileLocation = `/${item.name}`;

        const cachedFilePath = [
          courseFilesCache,
          fileLocation.substring(1),
          [filenameFromName ? `${filenameFromName} (${file.id})` : file.id, ext]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/');

        addFilesToQueue(
          [
            {
              id: file.id,
              name: file.name,
              url: fileUrl,
              filePath: cachedFilePath,
            },
          ],
          courseId,
          'course',
        );
      });
    }
  }, [
    isInQueue,
    item,
    courseId,
    courseFilesCache,
    addFilesToQueue,
    removeFilesFromQueue,
  ]);

  const trailingItem = useMemo(() => {
    if (!enableMultiSelect) return null;

    if (allFilesDownloaded) return null;

    return (
      <Checkbox
        isChecked={isInQueue}
        onPress={handleSelection}
        textStyle={{ marginHorizontal: 0 }}
        containerStyle={{ marginHorizontal: 0, marginVertical: 0 }}
      />
    );
  }, [enableMultiSelect, isInQueue, handleSelection, allFilesDownloaded]);

  return (
    <DirectoryListItem
      title={item.name}
      disabled={allFilesDownloaded && enableMultiSelect}
      subtitle={t('courseDirectoryListItem.subtitle', {
        count: item.files.length,
      })}
      onPress={() => {
        if (enableMultiSelect) {
          if (!allFilesDownloaded) {
            handleSelection();
          }
        } else {
          navigation.navigate('CourseDirectory', {
            courseId,
            directoryId: item.id,
            directoryName: item.name,
          });
        }
      }}
      trailingItem={trailingItem || undefined}
      isDownloaded={allFilesDownloaded}
      {...rest}
    />
  );
};
