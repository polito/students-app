import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useFullTextSearch } from '../../../core/hooks/useFullTextSearch';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import {
  CourseRecentFile,
  CourseRecentFileListItem,
} from '../components/CourseRecentFileListItem';
import { CourseContext } from '../contexts/CourseContext';
import { FilesCacheContext } from '../contexts/FilesCacheContext';
import { FilesCacheProvider } from '../providers/FilesCacheProvider';
import { isDirectory } from '../utils/fs-entry';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseDirectory'>;

const FileCacheChecker = () => {
  const { refresh } = useContext(FilesCacheContext);

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
  }, [directoryName]);

  return (
    <CourseContext.Provider value={courseId}>
      <FilesCacheProvider>
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
      </FilesCacheProvider>
    </CourseContext.Provider>
  );
};

interface SearchProps {
  courseId: number;
  searchFilter: string;
}

const schema = {
  name: 'string',
  mimeType: 'string',
  location: 'string',
} as const;

const CourseFileSearchFlatList = ({ courseId, searchFilter }: SearchProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const query = useMemo(() => ({ term: searchFilter }), [searchFilter]);
  const { result, isSearching } = useFullTextSearch(
    schema,
    query,
    recentFilesQuery?.data,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { paddingHorizontal } = useSafeAreaSpacing();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={result?.documents}
      scrollEnabled={scrollEnabled}
      contentContainerStyle={paddingHorizontal}
      keyExtractor={(item: CourseRecentFile) => item.id}
      renderItem={({ item }) => (
        <CourseRecentFileListItem
          item={item}
          onSwipeStart={() => setScrollEnabled(false)}
          onSwipeEnd={() => setScrollEnabled(true)}
        />
      )}
      refreshControl={<RefreshControl queries={[recentFilesQuery]} />}
      ItemSeparatorComponent={Platform.select({
        ios: () => <IndentedDivider />,
      })}
      ListEmptyComponent={
        isSearching ? (
          <EmptyState
            message={t('common.searching')}
            icon={faMagnifyingGlass}
          />
        ) : (
          <Text style={styles.noResultText}>
            {t('courseDirectoryScreen.noResult')}
          </Text>
        )
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
