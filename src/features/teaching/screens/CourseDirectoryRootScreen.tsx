import { FlatList } from 'react-native';

import { CourseDirectory, CourseFileOverview } from '@polito-it/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseFiles } from '../../../core/queries/courseHooks';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseDirectoryRoot'
>;

export const CourseDirectoryRootScreen = ({ route }: Props) => {
  const { courseId } = route.params;

  const filesQuery = useGetCourseFiles(courseId);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={filesQuery.data?.data}
      keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
      renderItem={({ item, index }) =>
        item.type === 'directory' ? (
          <CourseDirectoryListItem item={item} courseId={courseId} />
        ) : (
          <CourseFileListItem item={item} isDownloaded={index % 2 === 0} />
        )
      }
      refreshControl={createRefreshControl(filesQuery)}
      refreshing={filesQuery.isLoading}
      contentContainerStyle={bottomBarAwareStyles}
    />
  );
};
