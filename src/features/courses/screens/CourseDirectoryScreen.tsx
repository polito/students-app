import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { CourseFileOverviewWithLocation } from '../../../core/types/files';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { CourseContext } from '../contexts/CourseContext';
import { CourseFilesCacheContext } from '../contexts/CourseFilesCacheContext';
import { CourseFilesCacheProvider } from '../providers/CourseFilesCacheProvider';
import { isDirectory } from '../utils/fs-entry';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseDirectory'>;

const FileCacheChecker = () => {
  const { refresh } = useContext(CourseFilesCacheContext);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
};

export const CourseDirectoryScreen = ({ route, navigation }: Props) => {
  const { courseId, directoryId, directoryName } = route.params;
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const { paddingHorizontal } = useSafeAreaSpacing();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: directoryName ?? t('common.file_plural'),
      headerSearchBarOptions: {
        onChangeText: e => setSearchFilter(e.nativeEvent.text),
      },
    });
  }, [directoryName, navigation, t]);

  directoryQuery.data?.sort((a, b) => {
    if (a.type !== 'directory' && b.type !== 'directory') {
      const dateA = DateTime.fromJSDate(a.createdAt).startOf('minute');
      const dateB = DateTime.fromJSDate(b.createdAt).startOf('minute');

      if (dateA.equals(dateB)) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }

      return dateA > dateB ? -1 : 1;
    }
    return 0;
  });

  return (
    <CourseContext.Provider value={courseId}>
      <CourseFilesCacheProvider>
        <FileCacheChecker />
        {searchFilter ? (
          <CourseFileSearchFlatList
            courseId={courseId}
            searchFilter={searchFilter}
          />
        ) : (
          <FlatList
            contentInsetAdjustmentBehavior="automatic"
            data={directoryQuery.data}
            scrollEnabled={scrollEnabled}
            contentContainerStyle={paddingHorizontal}
            keyExtractor={(item: CourseDirectory | CourseFileOverview) =>
              item.id
            }
            initialNumToRender={15}
            renderItem={({ item }) =>
              isDirectory(item) ? (
                <CourseDirectoryListItem item={item} courseId={courseId} />
              ) : (
                <CourseFileListItem
                  item={item}
                  onSwipeStart={() => setScrollEnabled(false)}
                  onSwipeEnd={() => setScrollEnabled(true)}
                />
              )
            }
            refreshControl={<RefreshControl queries={[directoryQuery]} />}
            ItemSeparatorComponent={Platform.select({
              ios: IndentedDivider,
            })}
            ListFooterComponent={<BottomBarSpacer />}
          />
        )}
      </CourseFilesCacheProvider>
    </CourseContext.Provider>
  );
};

interface SearchProps {
  courseId: number;
  searchFilter: string;
}

const CourseFileSearchFlatList = ({ courseId, searchFilter }: SearchProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<
    CourseFileOverviewWithLocation[]
  >([]);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { paddingHorizontal } = useSafeAreaSpacing();

  useEffect(() => {
    if (!recentFilesQuery.data) return;
    setSearchResults(
      recentFilesQuery.data.filter(file =>
        file.name.toLowerCase().includes(searchFilter.toLowerCase()),
      ),
    );
  }, [recentFilesQuery.data, searchFilter]);

  const onSwipeStart = useCallback(() => setScrollEnabled(false), []);
  const onSwipeEnd = useCallback(() => setScrollEnabled(true), []);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={searchResults}
      scrollEnabled={scrollEnabled}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={4}
      contentContainerStyle={paddingHorizontal}
      keyExtractor={(item: CourseFileOverviewWithLocation) => item.id}
      renderItem={({ item }) => (
        <CourseRecentFileListItem
          item={item}
          onSwipeStart={onSwipeStart}
          onSwipeEnd={onSwipeEnd}
        />
      )}
      refreshControl={<RefreshControl queries={[recentFilesQuery]} />}
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
