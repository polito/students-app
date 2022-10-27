import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import {
  CourseRecentFile,
  CourseRecentFileListItem,
} from '../components/CourseRecentFileListItem';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseDirectory'>;

export const CourseDirectoryScreen = ({ route, navigation }: Props) => {
  const { courseId, directoryId } = route.params;

  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: e => setSearchFilter(e.nativeEvent.text),
      },
    });
  }, []);

  const directoryQuery = useGetCourseDirectory(courseId, directoryId);

  useEffect(() => {
    if (!directoryQuery.data) return;

    navigation.setOptions({
      headerTitle: directoryQuery.data.name,
    });
  }, [directoryQuery.data]);

  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return searchFilter ? (
    <CourseFileSearchFlatList courseId={courseId} searchFilter={searchFilter} />
  ) : (
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

interface SearchProps {
  courseId: number;
  searchFilter: string;
}

const CourseFileSearchFlatList = ({ courseId, searchFilter }: SearchProps) => {
  const [searchResults, setSearchResults] = useState([]);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);

  useEffect(() => {
    setSearchResults(
      recentFilesQuery.data.filter(file => file.name.includes(searchFilter)),
    );
  }, [searchFilter]);

  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  const { t } = useTranslation();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={searchResults}
      keyExtractor={(item: CourseRecentFile) => item.id}
      renderItem={({ item, index }) => (
        <CourseRecentFileListItem item={item} isDownloaded={index % 2 === 0} />
      )}
      refreshControl={createRefreshControl(recentFilesQuery)}
      refreshing={recentFilesQuery.isLoading}
      contentContainerStyle={bottomBarAwareStyles}
      ListEmptyComponent={
        <Text style={styles.noResultText}>
          {t('courseDirectoryScreen.noResult')}
        </Text>
      }
    />
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    noResultText: {
      padding: spacing[4],
    },
  });
