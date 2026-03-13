import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { NativeActionEvent } from '@react-native-menu/menu';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOnLeaveScreen } from '../../../core/hooks/useOnLeaveScreen';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  CourseSectionEnum,
  getCourseKey,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { FileScreenHeader } from '../components/FileScreenHeader';
import { MENU_ACTIONS } from '../constants';
import { useFileManagement } from '../hooks/useFileManagement';
import { FileStackParamList } from '../navigation/FileNavigator';

type Props = NativeStackScreenProps<FileStackParamList, 'RecentFiles'>;

const CourseFilesScreenContent = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const courseId = route.params.courseId;
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { clearNotificationScope } = useNotifications();
  const { updatePreference } = usePreferencesContext();
  const [searchFilter, setSearchFilter] = useState('');
  const styles = useStylesheet(createStyles);
  const onSwipeStart = useCallback(() => setScrollEnabled(false), []);
  const onSwipeEnd = useCallback(() => setScrollEnabled(true), []);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: getCourseKey(courseId, CourseSectionEnum.Files),
      });
    }, [courseId, queryClient]),
  );
  const {
    enableMultiSelect,
    allFilesSelected,
    sortedData,
    activeSort,
    sortOptions,
    toggleSelectAll,
    onPressSortOption,
    isRemoving,
    isDownloading,
  } = useFileManagement({
    courseId,
    data: recentFilesQuery.data,
    isDirectoryView: false,
  });
  const { downloads } = useDownloadsContext();

  const fileListData = useMemo(() => {
    const base = (sortedData || recentFilesQuery.data) ?? [];
    if (!searchFilter.trim()) return base;
    const q = searchFilter.trim().toLowerCase();
    return base.filter(item => (item.name ?? '').toLowerCase().includes(q));
  }, [sortedData, recentFilesQuery.data, searchFilter]);

  useOnLeaveScreen(() => {
    clearNotificationScope(['teaching', 'courses', `${courseId}`, 'files']);
  });

  const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
    switch (event) {
      case MENU_ACTIONS.SELECT:
        if (isDownloading || isRemoving) {
          return;
        }
        (navigation.getParent()?.getParent() as any)?.navigate(
          'CourseFileMultiSelect',
          { courseId, mode: 'recent' },
        );
        break;
      case MENU_ACTIONS.SELECT_ALL:
        toggleSelectAll();
        break;
      case MENU_ACTIONS.TOGGLE_FOLDERS:
        navigation.replace('DirectoryFiles', { courseId });
        updatePreference('filesScreen', 'directoryView');
        break;
      default:
        break;
    }
  };

  const { spacing } = useTheme();

  const footerSpacerHeight = spacing[20];

  return (
    <>
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
      <FileScreenHeader
        enableMultiSelect={enableMultiSelect}
        allFilesSelected={allFilesSelected}
        activeSort={activeSort}
        sortOptions={sortOptions}
        onPressSortOption={onPressSortOption}
        onPressOption={onPressOption}
        isDirectoryView={false}
        isSelectDisabled={isDownloading || isRemoving}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={fileListData}
          extraData={{ downloads, isRemoving }}
          contentContainerStyle={paddingHorizontal}
          scrollEnabled={scrollEnabled}
          keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={4}
          renderItem={({ item }) => {
            return (
              <CourseRecentFileListItem
                item={item as CourseFileOverview}
                onSwipeStart={onSwipeStart}
                onSwipeEnd={onSwipeEnd}
                enableMultiSelect={false}
                disabled={isRemoving}
              />
            );
          }}
          refreshControl={<RefreshControl queries={[recentFilesQuery]} />}
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
            !recentFilesQuery.isLoading ? (
              <OverviewList emptyStateText={t('courseFilesTab.empty')} />
            ) : null
          }
        />
      </View>
    </>
  );
};

const createStyles = ({ spacing, shapes, colors }: Theme) =>
  StyleSheet.create({
    textField: {
      borderRadius: shapes.lg,
    },
    searchBar: {
      paddingBottom: spacing[2],
      paddingTop: spacing[2],
      backgroundColor: colors.background,
    },
  });

export const CourseFilesScreen = ({ navigation, route }: Props) => {
  return <CourseFilesScreenContent navigation={navigation} route={route} />;
};
