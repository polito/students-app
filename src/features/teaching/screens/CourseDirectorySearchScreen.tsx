import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import { CourseDirectory, CourseFileOverview } from '@polito-it/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseDirectorySearch'
>;

export const CourseDirectorySearchScreen = ({ route }: Props) => {
  const { courseId, search } = route.params;

  const [searchQuery, setSearchQuery] = useState(search ?? '');
  const [filteredFiles, setFilteredFiles] = useState([]);

  const recentFilesQuery = useGetCourseFilesRecent(courseId);

  useEffect(() => {}, [search]);

  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      data={filteredFiles}
      keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
      renderItem={({ item, index }) =>
        item.type === 'directory' ? (
          <CourseDirectoryListItem item={item} courseId={courseId} />
        ) : (
          <CourseFileListItem item={item} isDownloaded={index % 2 === 0} />
        )
      }
      refreshControl={createRefreshControl(recentFilesQuery)}
      refreshing={recentFilesQuery.isLoading}
      style={bottomBarAwareStyles}
    />
  );
};
