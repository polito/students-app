import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import {
  CourseDirectory,
  CourseFileOverview,
} from '@polito/student-api-client';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FileNavigatorID } from '~/core/constants';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOnLeaveScreen } from '../../../core/hooks/useOnLeaveScreen';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CourseFileOverviewWithLocation } from '../../../core/types/files';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { FileScreenHeader } from '../components/FileScreenHeader';
import { ITEM_TYPES } from '../constants';
import { CourseContext } from '../contexts/CourseContext';
import { useFileManagement } from '../hooks/useFileManagement';
import { FileStackParamList } from '../navigation/FileNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList & FileStackParamList,
  'CourseDirectory' | 'DirectoryFiles'
>;

const CourseDirectoryScreenContent = ({ route, navigation }: Props) => {
  const { courseId, directoryId, directoryName } = route.params;
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [checkCompleteCount, setCheckCompleteCount] = useState(0);
  const [checkTimeoutExpired, setCheckTimeoutExpired] = useState(false);
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { updatePreference } = usePreferencesContext();
  const { spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const isFileNavigator = useMemo(() => {
    return navigation.getId() === FileNavigatorID;
  }, [navigation]);

  const { clearNotificationScope } = useNotifications();

  const directFileIds = useMemo(() => {
    const entries = directoryQuery.data ?? [];
    return entries
      .filter(entry => entry?.type === 'file')
      .map(entry => entry.id as string);
  }, [directoryQuery.data]);

  useOnLeaveScreen(() => {
    if (directFileIds.length === 0) return;
    directFileIds.forEach(fileId => {
      clearNotificationScope([
        'teaching',
        'courses',
        `${courseId}`,
        'files',
        fileId,
      ] as any);
    });
  });

  useFocusEffect(
    useCallback(() => {
      setListRefreshKey(k => k + 1);
    }, []),
  );

  const {
    sortedData,
    activeSort,
    sortOptions,
    onPressSortOption,
    isRemoving,
    isDownloading,
  } = useFileManagement({
    courseId,
    data: directoryQuery.data || undefined,
    isDirectoryView: true,
  });
  const { downloads } = useDownloadsContext();
  const wasRemovingRef = useRef(false);

  useEffect(() => {
    if (isRemoving) {
      wasRemovingRef.current = true;
    } else if (wasRemovingRef.current) {
      wasRemovingRef.current = false;
      setListRefreshKey(k => k + 1);
    }
  }, [isRemoving]);

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

  useEffect(() => {
    setCheckCompleteCount(0);
    setCheckTimeoutExpired(false);
    if (flattenedData.length === 0) return;
    const timer = setTimeout(() => setCheckTimeoutExpired(true), 500);
    return () => clearTimeout(timer);
  }, [flattenedData.length]);

  const onCheckComplete = useCallback(() => {
    setCheckCompleteCount(c => Math.min(c + 1, flattenedData.length));
  }, [flattenedData.length]);

  const isCheckingInitial = useMemo(() => {
    const skipCheck = route.params?.skipInitialDownloadCheck === true;
    if (skipCheck) return false;
    if (checkTimeoutExpired) return false;
    return (
      flattenedData.length > 0 && checkCompleteCount < flattenedData.length
    );
  }, [
    route.params?.skipInitialDownloadCheck,
    flattenedData.length,
    checkCompleteCount,
    checkTimeoutExpired,
  ]);

  const checkingOverlayStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    }),
    [],
  );

  const targetNav = isFileNavigator
    ? (navigation.getParent()?.getParent() as any)
    : navigation;

  const handleLongPressFile = useCallback(
    (fileId: string) => {
      if (isDownloading || isRemoving || isCheckingInitial) return;
      targetNav?.navigate('CourseFileMultiSelect', {
        courseId,
        mode: 'directory',
        directoryId,
        directoryName,
        initialSelectedIds: [fileId],
      });
    },
    [
      courseId,
      directoryId,
      directoryName,
      isDownloading,
      isRemoving,
      isCheckingInitial,
      targetNav,
    ],
  );

  const handleLongPressDirectory = useCallback(
    (fileIds: string[]) => {
      if (isDownloading || isRemoving || isCheckingInitial) return;
      if (fileIds.length === 0) return;
      targetNav?.navigate('CourseFileMultiSelect', {
        courseId,
        mode: 'directory',
        directoryId,
        directoryName,
        initialSelectedIds: fileIds,
      });
    },
    [
      courseId,
      directoryId,
      directoryName,
      isDownloading,
      isRemoving,
      isCheckingInitial,
      targetNav,
    ],
  );

  const onToggleView = useCallback(() => {
    navigation.replace('RecentFiles', { courseId });
    updatePreference('filesScreen', 'filesView');
  }, [navigation, courseId, updatePreference]);

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
          activeSort={activeSort}
          sortOptions={sortOptions}
          onPressSortOption={onPressSortOption}
          isDirectoryView={true}
          onToggleView={onToggleView}
          isInsideFolder={!!directoryId}
          isSelectDisabled={isDownloading || isRemoving || isCheckingInitial}
        />
      </View>

      {searchFilter ? (
        <CourseFileSearchFlatList
          courseId={courseId}
          searchFilter={searchFilter}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            contentInsetAdjustmentBehavior="automatic"
            data={flattenedData}
            extraData={{
              downloads,
              listRefreshKey,
              checkCompleteCount,
              isRemoving,
            }}
            scrollEnabled={scrollEnabled}
            contentContainerStyle={paddingHorizontal}
            keyExtractor={(item: CourseDirectory | CourseFileOverview) =>
              item.id
            }
            initialNumToRender={15}
            renderItem={({ item }) =>
              (item as any).type === ITEM_TYPES.DIRECTORY ? (
                <CourseDirectoryListItem
                  courseId={courseId}
                  item={item as CourseDirectory}
                  enableMultiSelect={false}
                  listRefreshKey={listRefreshKey}
                  onCheckComplete={onCheckComplete}
                  disabled={isCheckingInitial || isRemoving}
                  onLongPress={handleLongPressDirectory}
                />
              ) : (
                <CourseFileListItem
                  item={item as CourseFileOverview}
                  onSwipeStart={() => setScrollEnabled(false)}
                  onSwipeEnd={() => setScrollEnabled(true)}
                  enableMultiSelect={false}
                  onCheckComplete={onCheckComplete}
                  disabled={isCheckingInitial || isRemoving}
                  onLongPress={() =>
                    handleLongPressFile((item as CourseFileOverview).id)
                  }
                />
              )
            }
            refreshControl={
              <RefreshControl manual queries={[directoryQuery]} />
            }
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
          {isCheckingInitial && (
            <View style={checkingOverlayStyle}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </View>
      )}
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
