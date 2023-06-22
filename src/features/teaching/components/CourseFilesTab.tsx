import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform } from 'react-native';

import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';
import { useFocusEffect } from '@react-navigation/native';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { FilesCacheContext } from '../contexts/FilesCacheContext';
import { CourseTabProps } from '../screens/CourseScreen';
import { CourseRecentFileListItem } from './CourseRecentFileListItem';

export const CourseFilesTab = ({ courseId, navigation }: CourseTabProps) => {
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { refresh } = useContext(FilesCacheContext);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const { paddingHorizontal } = useSafeAreaSpacing();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={recentFilesQuery.data}
        contentContainerStyle={paddingHorizontal}
        scrollEnabled={scrollEnabled}
        keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
        initialNumToRender={15}
        renderItem={({ item }) => {
          return (
            <CourseRecentFileListItem
              item={item}
              onSwipeStart={() => setScrollEnabled(false)}
              onSwipeEnd={() => setScrollEnabled(true)}
            />
          );
        }}
        refreshControl={<RefreshControl queries={[recentFilesQuery]} />}
        ItemSeparatorComponent={Platform.select({
          ios: IndentedDivider,
        })}
        ListFooterComponent={
          <>
            <CtaButtonSpacer />
            <BottomBarSpacer />
          </>
        }
        ListEmptyComponent={
          !recentFilesQuery.isLoading ? (
            <EmptyState
              message={t('courseFilesTab.empty')}
              icon={faFolderOpen}
            />
          ) : null
        }
      />
      {recentFilesQuery.data && recentFilesQuery.data.length > 0 && (
        <CtaButton
          title={t('courseFilesTab.navigateFolders')}
          icon={faFolderOpen}
          action={() => navigation!.navigate('CourseDirectory', { courseId })}
        />
      )}
    </>
  );
};
