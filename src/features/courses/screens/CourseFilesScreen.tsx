import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, View } from 'react-native';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOnLeaveScreen } from '../../../core/hooks/useOnLeaveScreen';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { sortByNameAsc } from '../../../utils/sorting';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { FileScreenHeader } from '../components/FileScreenHeader';
import { MENU_ACTIONS } from '../constants';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';
import { useFileManagement } from '../hooks/useFileManagement';
import { FileStackParamList } from '../navigation/FileNavigator';

type Props = NativeStackScreenProps<FileStackParamList, 'RecentFiles'>;

const CourseFilesScreenContent = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const courseId = route.params.courseId;
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { clearNotificationScope } = useNotifications();
  const { updatePreference } = usePreferencesContext();
  const [courseFilesCache] = useCourseFilesCachePath();
  const onSwipeStart = useCallback(() => setScrollEnabled(false), []);
  const onSwipeEnd = useCallback(() => setScrollEnabled(true), []);
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
    renderCtaButtons,
  } = useFileManagement({
    courseId,
    courseFilesCache,
    data: recentFilesQuery.data,
    isDirectoryView: false,
  });

  useEffect(() => {
    if (recentFilesQuery.data) {
      setSortedData(sortByNameAsc(recentFilesQuery.data));
    }
  }, [recentFilesQuery.data, setSortedData]);

  useOnLeaveScreen(() => {
    clearNotificationScope(['teaching', 'courses', courseId, 'files']);
  });

  const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
    switch (event) {
      case MENU_ACTIONS.SELECT:
        toggleMultiSelect();
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

  const footerSpacerHeight = useMemo(() => {
    if (enableMultiSelect) {
      return spacing[12] * 2;
    }
    return spacing[20];
  }, [enableMultiSelect, spacing]);

  return (
    <>
      <FileScreenHeader
        enableMultiSelect={enableMultiSelect}
        allFilesSelected={allFilesSelected}
        activeSort={activeSort}
        sortOptions={sortOptions}
        onPressSortOption={onPressSortOption}
        onPressOption={onPressOption}
        isDirectoryView={false}
      />

      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={sortedData || recentFilesQuery.data}
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
              enableMultiSelect={enableMultiSelect}
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
      {navigation && renderCtaButtons(true)}
    </>
  );
};

export const CourseFilesScreen = ({ navigation, route }: Props) => {
  return <CourseFilesScreenContent navigation={navigation} route={route} />;
};
