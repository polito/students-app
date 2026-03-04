import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, View } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOnLeaveScreen } from '../../../core/hooks/useOnLeaveScreen';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { sortByNameAsc } from '../../../utils/sorting';
import { CourseFileMultiSelectModal } from '../components/CourseFileMultiSelectModal';
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
  const [multiSelectModalVisible, setMultiSelectModalVisible] = useState(false);
  const [checkCompleteCount, setCheckCompleteCount] = useState(0);
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
    data: recentFilesQuery.data,
    isDirectoryView: false,
  });
  const { downloads } = useDownloadsContext();

  const handleCloseModalOnly = useCallback(() => {
    setMultiSelectModalVisible(false);
  }, []);

  const handleCloseMultiSelectModal = useCallback(() => {
    setMultiSelectModalVisible(false);
    toggleMultiSelect();
  }, [toggleMultiSelect]);

  const handleModalHide = useCallback(
    (reason?: 'download' | 'remove') => {
      if (reason !== 'download' && reason !== 'remove') {
        handleCloseMultiSelectModal();
      }
      setEnableMultiSelect(false);
    },
    [handleCloseMultiSelectModal, setEnableMultiSelect],
  );

  useEffect(() => {
    if (recentFilesQuery.data) {
      setSortedData(sortByNameAsc(recentFilesQuery.data));
    }
  }, [recentFilesQuery.data, setSortedData]);

  const fileListData = sortedData || recentFilesQuery.data;
  const fileListLength = fileListData?.length ?? 0;

  useEffect(() => {
    setCheckCompleteCount(0);
  }, [fileListLength]);

  const onCheckComplete = useCallback(() => {
    setCheckCompleteCount(c => Math.min(c + 1, fileListLength));
  }, [fileListLength]);

  const isCheckingInitial =
    fileListLength > 0 && checkCompleteCount < fileListLength;

  useOnLeaveScreen(() => {
    clearNotificationScope(['teaching', 'courses', `${courseId}`, 'files']);
  });

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
        isSelectDisabled={isDownloading || isRemoving || isCheckingInitial}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={sortedData || recentFilesQuery.data}
          extraData={{ downloads, checkCompleteCount }}
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
                onCheckComplete={onCheckComplete}
                disabled={isCheckingInitial}
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
        {isCheckingInitial && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
      <CourseFileMultiSelectModal
        visible={multiSelectModalVisible}
        onClose={handleCloseMultiSelectModal}
        onCloseModalOnly={handleCloseModalOnly}
        onModalHide={handleModalHide}
        courseId={courseId}
        courseFilesCache={courseFilesCache}
        flatFileList={recentFilesQuery.data ?? []}
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

export const CourseFilesScreen = ({ navigation, route }: Props) => {
  return <CourseFilesScreenContent navigation={navigation} route={route} />;
};
