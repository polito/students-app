import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { List } from '@lib/ui/components/List';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

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
  const styles = useStylesheet(createStyles);

  return (
    <>
      <ScrollView
        contentContainerStyle={bottomBarAwareStyles}
        refreshControl={<RefreshControl {...refreshControl} />}
        scrollEnabled={scrollEnabled}
      >
        {recentFilesQuery.data?.length > 0 ? (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title={t('courseFilesTab.recentSectionTitle')}
              separator={false}
            />
            <List indented>
              {recentFilesQuery.data?.slice(0, 5).map(file => (
                <CourseRecentFileListItem
                  key={file.id}
                  item={file}
                  onSwipeStart={() => setScrollEnabled(false)}
                  onSwipeEnd={() => setScrollEnabled(true)}
                />
              ))}
            </List>
          </View>
        ) : (
          <EmptyState message={t('courseFilesTab.empty')} icon={faFolderOpen} />
        )}
      </ScrollView>
      {recentFilesQuery.data?.length > 0 && (
        <CtaButton
          title={t('courseFilesTab.browseFiles')}
          action={() => navigation.navigate('CourseDirectory', { courseId })}
        />
      )}
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    sectionContainer: {
      paddingVertical: spacing[5],
    },
    buttonContainer: {
      paddingHorizontal: spacing[4],
    },
    noResultText: {
      padding: spacing[4],
    },
  });
