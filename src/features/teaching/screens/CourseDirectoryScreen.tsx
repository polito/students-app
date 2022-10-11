import { useEffect } from 'react';
import { FlatList } from 'react-native';

import { CourseDirectory, CourseFileOverview } from '@polito-it/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseDirectory } from '../../../core/queries/courseHooks';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseDirectory'>;

export const CourseDirectoryScreen = ({ route, navigation }: Props) => {
  const { courseId, directoryId } = route.params;

  const directoryQuery = useGetCourseDirectory(courseId, directoryId);

  useEffect(() => {
    if (!directoryId || !directoryQuery.data) return;

    navigation.setOptions({
      headerTitle: directoryQuery.data.name,
    });
  }, [directoryQuery.data]);

  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={directoryQuery.data?.files}
      keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
      renderItem={({ item, index }) =>
        item.type === 'directory' ? (
          <CourseDirectoryListItem item={item} courseId={courseId} />
        ) : (
          <CourseFileListItem item={item} isDownloaded={index % 2 === 0} />
        )
      }
      refreshControl={createRefreshControl(directoryQuery)}
      refreshing={directoryQuery.isLoading}
      contentContainerStyle={bottomBarAwareStyles}
    />
  );
};
