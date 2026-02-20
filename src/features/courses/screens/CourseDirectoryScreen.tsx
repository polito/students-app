import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { NativeActionEvent } from '@react-native-menu/menu';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FileNavigatorID } from '~/core/constants';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  getFlattenedCourseFiles,
  useGetCourseDirectory,
  useGetCourseFiles,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CourseFileOverviewWithLocation } from '../../../core/types/files';
import { sortByNameAsc } from '../../../utils/sorting';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import {
  CourseFileMultiSelectModal,
  type DirectoryOrFile,
} from '../components/CourseFileMultiSelectModal';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { FileScreenHeader } from '../components/FileScreenHeader';
import { ITEM_TYPES, MENU_ACTIONS } from '../constants';
import { CourseContext } from '../contexts/CourseContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';
import { useFileManagement } from '../hooks/useFileManagement';
import { FileStackParamList } from '../navigation/FileNavigator';
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
  const [multiSelectModalVisible, setMultiSelectModalVisible] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const courseFilesQuery = useGetCourseFiles(courseId);
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { updatePreference } = usePreferencesContext();
  const [courseFilesCache] = useCourseFilesCachePath();
  const { spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const isFileNavigator = useMemo(() => {
    return navigation.getId() === FileNavigatorID;
  }, [navigation]);

  const {
    enableMultiSelect,
    setEnableMultiSelect,
    allFilesSelected,
    sortedData,
    setSortedData,
    activeSort,
    sortOptions,
    toggleMultiSelect,
    toggleSelectAll,
    onPressSortOption,
    handleDownloadAction,
    handleRemoveAction,
    downloadButtonTitle,
    removeButtonTitle,
    isDownloadButtonDisabled,
    isRemoveButtonDisabled,
    isRemoving,
    isDownloading,
    downloadButtonProgress,
    downloadButtonStyle,
    removeButtonStyle,
  } = useFileManagement({
    courseId,
    courseFilesCache,
    data: directoryQuery.data || undefined,
    isDirectoryView: true,
  });
  const { downloads } = useDownloadsContext();
  const wasRemovingRef = useRef(false);

  const handleCloseModalOnly = useCallback(() => {
    setMultiSelectModalVisible(false);
  }, []);

  const handleCloseMultiSelectModal = useCallback(() => {
    setMultiSelectModalVisible(false);
    toggleMultiSelect();
  }, [toggleMultiSelect]);

  useEffect(() => {
    if (isRemoving) {
      wasRemovingRef.current = true;
    } else if (wasRemovingRef.current) {
      wasRemovingRef.current = false;
      setListRefreshKey(k => k + 1);
    }
  }, [isRemoving]);

  const handleModalHide = useCallback(
    (reason?: 'download' | 'remove') => {
      setListRefreshKey(k => k + 1);
      if (reason !== 'download' && reason !== 'remove') {
        handleCloseMultiSelectModal();
      }
      setEnableMultiSelect(false);
    },
    [handleCloseMultiSelectModal, setEnableMultiSelect],
  );

  useEffect(() => {
    if (directoryQuery.data) {
      const directories = directoryQuery.data.filter(item => isDirectory(item));
      const files = directoryQuery.data.filter(item => !isDirectory(item));

      const sortedDirectories = sortByNameAsc(directories);
      const sortedFiles = sortByNameAsc(files);

      setSortedData([...sortedDirectories, ...sortedFiles]);
    }
  }, [directoryQuery.data, setSortedData]);

  const flattenedData = useMemo(() => {
    if (!sortedData) return [];
    return sortedData;
  }, [sortedData]) as (CourseDirectory | CourseFileOverview)[];

  const flatFileList = useMemo(() => {
    if (!courseFilesQuery.data) return [];
    return getFlattenedCourseFiles(courseFilesQuery.data, directoryId);
  }, [courseFilesQuery.data, directoryId]);

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
        if (isDownloading || isRemoving) {
          return;
        }
        if (multiSelectModalVisible) {
          setMultiSelectModalVisible(false);
          toggleMultiSelect();
        } else {
          toggleMultiSelect();
          setMultiSelectModalVisible(true);
        }
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

  const footerSpacerHeight = 0;

  return (
    <>
      {isFileNavigator && (
        <CourseSearchBar
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      )}
      <View
        style={[
          paddingHorizontal,
          Platform.OS === 'ios' &&
            !isFileNavigator && { paddingTop: headerHeight + spacing[2] },
        ]}
      >
        <FileScreenHeader
          enableMultiSelect={enableMultiSelect}
          allFilesSelected={allFilesSelected}
          activeSort={activeSort}
          sortOptions={sortOptions}
          onPressSortOption={onPressSortOption}
          onPressOption={onPressOption}
          isDirectoryView={true}
          isInsideFolder={!!directoryId}
          isSelectDisabled={isDownloading || isRemoving}
        />
      </View>

      {searchFilter ? (
        <CourseFileSearchFlatList
          courseId={courseId}
          searchFilter={searchFilter}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={flattenedData}
          extraData={{ downloads, listRefreshKey }}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={paddingHorizontal}
          keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
          initialNumToRender={15}
          renderItem={({ item }) =>
            (item as any).type === ITEM_TYPES.DIRECTORY ? (
              <CourseDirectoryListItem
                courseId={courseId}
                item={item as CourseDirectory}
                enableMultiSelect={false}
                listRefreshKey={listRefreshKey}
              />
            ) : (
              <CourseFileListItem
                item={item as CourseFileOverview}
                onSwipeStart={() => setScrollEnabled(false)}
                onSwipeEnd={() => setScrollEnabled(true)}
                enableMultiSelect={false}
              />
            )
          }
          refreshControl={<RefreshControl manual queries={[directoryQuery]} />}
          ItemSeparatorComponent={Platform.select({
            ios: IndentedDivider,
          })}
          ListFooterComponent={
            <>
              <View style={{ height: footerSpacerHeight }} />
              <BottomBarSpacer />
            </>
          }
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
      <CourseFileMultiSelectModal
        visible={multiSelectModalVisible}
        onClose={handleCloseMultiSelectModal}
        onCloseModalOnly={handleCloseModalOnly}
        onModalHide={handleModalHide}
        courseId={courseId}
        courseFilesCache={courseFilesCache}
        flatFileList={flatFileList}
        displayItems={flattenedData as DirectoryOrFile[]}
        courseFilesTree={courseFilesQuery.data ?? undefined}
        handleDownloadAction={handleDownloadAction}
        handleRemoveAction={handleRemoveAction}
        downloadButtonTitle={downloadButtonTitle}
        removeButtonTitle={removeButtonTitle}
        isDownloadButtonDisabled={isDownloadButtonDisabled}
        isRemoveButtonDisabled={isRemoveButtonDisabled}
        isDownloading={isDownloading}
        downloadButtonProgress={downloadButtonProgress}
        downloadButtonStyle={downloadButtonStyle}
        removeButtonStyle={removeButtonStyle}
      />
    </>
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
