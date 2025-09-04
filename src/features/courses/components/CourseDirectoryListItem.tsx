import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableHighlightProps } from 'react-native';
import { extension, lookup } from 'react-native-mime-types';

import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import { CourseDirectory } from '@polito/api-client';
import { BASE_PATH } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';

import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { splitNameAndExtension } from '../../../utils/files';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

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
  const { downloadQueue, addToQueue, removeFromQueue, downloads } =
    useDownloadsContext();
  const [courseFilesCache] = useCourseFilesCachePath();

  const isInQueue = useMemo(() => {
    // Check if any file from this specific directory is in the queue
    const directoryFiles = item.files.filter(file => file.type === 'file');

    return directoryFiles.some(file =>
      downloadQueue.files.some(queuedFile => queuedFile.id === file.id),
    );
  }, [downloadQueue.files, item]);

  const allFilesDownloaded = useMemo(() => {
    const directoryFiles = item.files.filter(file => file.type === 'file');

    if (directoryFiles.length === 0) return false;

    // Check if all files in the directory are downloaded
    return directoryFiles.every(file => {
      const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${file.id}`;
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

      const downloadKey = `${fileUrl}:${cachedFilePath}`;
      return downloads[downloadKey]?.isDownloaded ?? false;
    });
  }, [item, courseId, courseFilesCache, downloads]);

  const handleSelection = useCallback(() => {
    // Use the files directly from the directory item (this was working before)
    const directoryFiles = item.files.filter(file => file.type === 'file');

    if (isInQueue) {
      // Remove all files from this specific directory from the queue
      directoryFiles.forEach(file => {
        removeFromQueue(file.id);
      });
    } else {
      // Add all files from this specific directory to the queue
      directoryFiles.forEach(file => {
        const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${file.id}`;

        // Use the same logic as CourseFileListItem for consistency
        let ext: string | null = extension(file.mimeType!);
        const [filenameFromName, extensionFromName] = splitNameAndExtension(
          file.name,
        );
        if (!ext && extensionFromName && lookup(extensionFromName)) {
          ext = extensionFromName;
        }

        // Construct the file path based on the directory name
        // Since we're in a directory, the path should be /directoryName
        const fileLocation = `/${item.name}`;

        const cachedFilePath = [
          courseFilesCache,
          fileLocation.substring(1), // Remove leading slash
          [filenameFromName ? `${filenameFromName} (${file.id})` : file.id, ext]
            .filter(Boolean)
            .join('.'),
        ]
          .filter(Boolean)
          .join('/');

        addToQueue({
          id: file.id,
          name: file.name,
          url: fileUrl,
          filePath: cachedFilePath,
          courseId,
        });
      });
    }
  }, [
    isInQueue,
    item,
    courseId,
    courseFilesCache,
    addToQueue,
    removeFromQueue,
  ]);

  const trailingItem = useMemo(() => {
    if (!enableMultiSelect) return null;

    return (
      <Checkbox
        isChecked={isInQueue}
        onPress={handleSelection}
        textStyle={{ marginHorizontal: 0 }}
        containerStyle={{ marginHorizontal: 0, marginVertical: 0 }}
      />
    );
  }, [enableMultiSelect, isInQueue, handleSelection]);

  return (
    <DirectoryListItem
      title={item.name}
      subtitle={t('courseDirectoryListItem.subtitle', {
        count: item.files.length,
      })}
      onPress={() => {
        if (enableMultiSelect) {
          handleSelection();
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
