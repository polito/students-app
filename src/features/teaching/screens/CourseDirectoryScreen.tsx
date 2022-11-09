import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
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
import { isDirectory } from '../utils/fs-entry';

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
      renderItem={({ item }) =>
        isDirectory(item) ? (
          <CourseDirectoryListItem item={item} courseId={courseId} />
        ) : (
          <CourseFileListItem item={item} />
        )
      }
      refreshControl={createRefreshControl(directoryQuery)}
      refreshing={directoryQuery.isLoading}
      contentContainerStyle={bottomBarAwareStyles}
      ItemSeparatorComponent={Platform.select({
        ios: IndentedDivider,
      })}
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
      renderItem={({ item }) => <CourseRecentFileListItem item={item} />}
      refreshControl={createRefreshControl(recentFilesQuery)}
      refreshing={recentFilesQuery.isLoading}
      contentContainerStyle={bottomBarAwareStyles}
      ItemSeparatorComponent={Platform.select({
        ios: () => <IndentedDivider />,
      })}
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
