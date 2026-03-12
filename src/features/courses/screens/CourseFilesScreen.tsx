import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, View } from 'react-native';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
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
import { sortByNameAsc } from '../../../utils/sorting';
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
    setSortedData,
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

  useEffect(() => {
    if (recentFilesQuery.data) {
      setSortedData(sortByNameAsc(recentFilesQuery.data));
    }
  }, [recentFilesQuery.data, setSortedData]);

  const fileListData = useMemo(
    () => (sortedData || recentFilesQuery.data) ?? [],
    [sortedData, recentFilesQuery.data],
  );

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

export const CourseFilesScreen = ({ navigation, route }: Props) => {
  return <CourseFilesScreenContent navigation={navigation} route={route} />;
};
