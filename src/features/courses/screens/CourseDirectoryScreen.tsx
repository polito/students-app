import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FileNavigatorID } from '~/core/constants';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CourseFileOverviewWithLocation } from '../../../core/types/files';
import { sortByNameAsc } from '../../../utils/sorting';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { FileScreenHeader } from '../components/FileScreenHeader';
import { ITEM_TYPES, MENU_ACTIONS } from '../constants';
import { CourseContext } from '../contexts/CourseContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';
import { useFileManagement } from '../hooks/useFileManagement';
import { FileStackParamList } from '../navigation/FileNavigator';
import { CourseFilesCacheProvider } from '../providers/CourseFilesCacheProvider';
import { isDirectory } from '../utils/fs-entry';

type Props = NativeStackScreenProps<
  TeachingStackParamList & FileStackParamList,
  'CourseDirectory' | 'DirectoryFiles'
>;

const CourseDirectoryScreenContent = ({ route, navigation }: Props) => {
  const { courseId, directoryId, directoryName } = route.params;
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { updatePreference } = usePreferencesContext();
  const [courseFilesCache] = useCourseFilesCachePath();

  const isFileNavigator = useMemo(() => {
    return navigation.getId() === FileNavigatorID;
  }, [navigation]);

  const {
    enableMultiSelect,
    allFilesSelected,
    sortedData,
    setSortedData,
    activeSort,
    sortOptions,
    toggleMultiSelect,
    toggleSelectAll,
    onPressSortOption,
    downloadButtonTitle,
    downloadButtonIcon,
    downloadButtonProgress,
    downloadButtonStyle,
    handleDownloadAction,
  } = useFileManagement({
    courseId,
    courseFilesCache,
    data: directoryQuery.data || undefined,
    isDirectoryView: true,
  });

  useEffect(() => {
    if (directoryQuery.data) {
      // Separate directories and files
      const directories = directoryQuery.data.filter(item => isDirectory(item));
      const files = directoryQuery.data.filter(item => !isDirectory(item));

      // Sort directories and files separately by name (A-Z)
      const sortedDirectories = sortByNameAsc(directories);
      const sortedFiles = sortByNameAsc(files);

      // Combine directories first, then files
      setSortedData([...sortedDirectories, ...sortedFiles]);
    }
  }, [directoryQuery.data, setSortedData]);

  const flattenedData = useMemo(() => {
    if (!sortedData) return [];
    return sortedData;
  }, [sortedData]) as (CourseDirectory | CourseFileOverview)[];

  useEffect(() => {
    if (!isFileNavigator) {
      navigation.setOptions({
        headerTitle: directoryName ?? t('common.file_plural'),
      });
    }
  }, [directoryName, isFileNavigator, navigation, t]);

  const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
    switch (event) {
      case MENU_ACTIONS.SELECT:
        toggleMultiSelect();
        break;
      case MENU_ACTIONS.SELECT_ALL:
        toggleSelectAll();
        break;
      case MENU_ACTIONS.TOGGLE_FOLDERS:
        navigation.replace('RecentFiles', { courseId });
        updatePreference('filesScreen', 'filesView');
        break;
      default:
        break;
    }
  };
  return (
    <CourseFilesCacheProvider>
      {isFileNavigator && (
        <CourseSearchBar
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      )}
      <FileScreenHeader
        enableMultiSelect={enableMultiSelect}
        allFilesSelected={allFilesSelected}
        activeSort={activeSort}
        sortOptions={sortOptions}
        onPressSortOption={onPressSortOption}
        onPressOption={onPressOption}
        isDirectoryView={true}
      />

      {searchFilter ? (
        <CourseFileSearchFlatList
          courseId={courseId}
          searchFilter={searchFilter}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={flattenedData}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={paddingHorizontal}
          keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
          initialNumToRender={15}
          renderItem={({ item }) =>
            (item as any).type === ITEM_TYPES.DIRECTORY ? (
              <CourseDirectoryListItem
                courseId={courseId}
                item={item as CourseDirectory}
                enableMultiSelect={enableMultiSelect}
              />
            ) : (
              <CourseFileListItem
                item={item as CourseFileOverview}
                onSwipeStart={() => setScrollEnabled(false)}
                onSwipeEnd={() => setScrollEnabled(true)}
                enableMultiSelect={enableMultiSelect}
              />
            )
          }
          refreshControl={<RefreshControl manual queries={[directoryQuery]} />}
          ItemSeparatorComponent={Platform.select({
            ios: IndentedDivider,
          })}
          ListFooterComponent={<BottomBarSpacer />}
          ListEmptyComponent={
            !directoryQuery.isLoading ? (
              <OverviewList
                emptyStateText={
                  isFileNavigator
                    ? t('courseDirectoryScreen.emptyRootFolder')
                    : t('courseDirectoryScreen.emptyFolder')
                }
              />
            ) : null
          }
        />
      )}
      {navigation && enableMultiSelect && (
        <CtaButton
          title={downloadButtonTitle}
          icon={downloadButtonIcon}
          action={handleDownloadAction}
          progress={downloadButtonProgress}
          style={downloadButtonStyle}
        />
      )}
    </CourseFilesCacheProvider>
  );
};

interface SearchFlatListProps {
  courseId: number;
  searchFilter: string;
}

interface SearchBarProps {
  searchFilter: string;
  setSearchFilter: (search: string) => void;
}

const CourseSearchBar = ({ searchFilter, setSearchFilter }: SearchBarProps) => {
  const { paddingHorizontal } = useSafeAreaSpacing();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  return (
    <Row align="center" style={[paddingHorizontal, styles.searchBar]}>
      <TranslucentTextField
        autoFocus={searchFilter.length !== 0}
        autoCorrect={false}
        leadingIcon={faSearch}
        value={searchFilter}
        onChangeText={setSearchFilter}
        style={[GlobalStyles.grow, styles.textField]}
        label={t('courseDirectoryScreen.search')}
        editable={true}
        isClearable={!!searchFilter}
        onClear={() => setSearchFilter('')}
        onClearLabel={t('contactsScreen.clearSearch')}
      />
    </Row>
  );
};

const CourseFileSearchFlatList = ({
  courseId,
  searchFilter,
}: SearchFlatListProps) => {
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
      refreshControl={<RefreshControl manual queries={[recentFilesQuery]} />}
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

const createStyles = ({ spacing, shapes, colors }: Theme) =>
  StyleSheet.create({
    noResultText: {
      padding: spacing[4],
    },
    textField: {
      borderRadius: shapes.lg,
    },
    searchBar: {
      paddingBottom: spacing[2],
      paddingTop: spacing[2],
      backgroundColor: colors.background,
    },
  });

export const CourseDirectoryScreen = ({ route, navigation }: Props) => {
  const { courseId } = route.params;

  return (
    <CourseContext.Provider value={courseId}>
      <CourseDirectoryScreenContent route={route} navigation={navigation} />
    </CourseContext.Provider>
  );
};
