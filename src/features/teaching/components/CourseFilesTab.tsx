import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform } from 'react-native';

import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { CourseDirectory, CourseFileOverview } from '@polito/api-client';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { CourseRecentFileListItem } from './CourseRecentFileListItem';

export const CourseFilesTab = ({ courseId, navigation }: CourseTabProps) => {
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const refreshControl = useRefreshControl(recentFilesQuery);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={recentFilesQuery.data}
        scrollEnabled={scrollEnabled}
        keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
        initialNumToRender={15}
        renderItem={({ item }) => (
          <CourseRecentFileListItem
            item={item}
            onSwipeStart={() => setScrollEnabled(false)}
            onSwipeEnd={() => setScrollEnabled(true)}
          />
        )}
        {...refreshControl}
        contentContainerStyle={bottomBarAwareStyles}
        ItemSeparatorComponent={Platform.select({
          ios: IndentedDivider,
        })}
        ListEmptyComponent={
          <EmptyState message={t('courseFilesTab.empty')} icon={faFolderOpen} />
        }
      />
      {recentFilesQuery.data?.length > 0 && (
        <CtaButton
          title={t('courseFilesTab.navigateFolders')}
          action={() => navigation.navigate('CourseDirectory', { courseId })}
        />
      )}
    </>
  );
};
