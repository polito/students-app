import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import {
  CourseDirectory,
  CourseFileOverview,
} from '@polito/student-api-client';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import {
  useAccessibility,
  useAnnounceLoading,
} from '../../../core/hooks/useAccessibilty';
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
import { useFileManagement } from '../hooks/useFileManagement';
import { FileStackParamList } from '../navigation/FileNavigator';

type Props = NativeStackScreenProps<FileStackParamList, 'RecentFiles'>;

const CourseFilesScreenContent = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const courseId = route.params.courseId;
  const multiSelectNav =
    (navigation.getParent()?.getParent() as any) ?? navigation;
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  useAnnounceLoading(recentFilesQuery.isLoading);
  const { getListAccessibilityProps } = useAccessibility();
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
    sortedData,
    activeSort,
    sortOptions,
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

  useFocusEffect(
    useCallback(() => {
      if (!recentFilesQuery.isLoading && fileListData.length === 0) {
        const timeoutId = setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(t('courseFilesTab.empty'));
        }, 500);
        return () => clearTimeout(timeoutId);
      }
      return undefined;
    }, [recentFilesQuery.isLoading, fileListData.length, t]),
  );

  const onToggleView = useCallback(() => {
    navigation.replace('DirectoryFiles', { courseId });
    updatePreference('filesScreen', 'directoryView');
  }, [navigation, courseId, updatePreference]);

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
        activeSort={activeSort}
        sortOptions={sortOptions}
        onPressSortOption={onPressSortOption}
        isDirectoryView={false}
        onToggleView={onToggleView}
        isSelectDisabled={isDownloading || isRemoving}
      />

      <View
        style={{ flex: 1 }}
        {...getListAccessibilityProps(
          t('courseInfoTab.files'),
          fileListData.length,
        )}
      >
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
            const fileItem = item as CourseFileOverview;
            return (
              <CourseRecentFileListItem
                item={fileItem}
                onSwipeStart={onSwipeStart}
                onSwipeEnd={onSwipeEnd}
                enableMultiSelect={false}
                disabled={isRemoving}
                onLongPress={() => {
                  if (isDownloading || isRemoving) return;
                  multiSelectNav?.navigate('CourseFileMultiSelect', {
                    courseId,
                    mode: 'recent',
                    initialSelectedIds: [fileItem.id],
                  });
                }}
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
