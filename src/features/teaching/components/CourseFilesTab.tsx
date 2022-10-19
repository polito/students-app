import { useTranslation } from 'react-i18next';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseFilesRecent } from '../../../core/queries/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { CourseRecentFileListItem } from './CourseRecentFileListItem';

export const CourseFilesTab = ({ courseId, navigation }: CourseTabProps) => {
  const { t } = useTranslation();

  const recentFilesQuery = useGetCourseFilesRecent(courseId);

  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);

  return (
    <ScrollView
      style={bottomBarAwareStyles}
      refreshControl={createRefreshControl(recentFilesQuery)}
    >
      <View style={styles.sectionContainer}>
        <SectionHeader title={t('CourseFilesTab.Title')} />
        <SectionList loading={recentFilesQuery.isLoading}>
          {recentFilesQuery.data?.slice(0, 5).map((file, index) => (
            <CourseRecentFileListItem
              key={file.id}
              item={file}
              isDownloaded={index % 3 === 0}
            />
          ))}
          {recentFilesQuery.data?.length === 0 && (
            <ListItem title={t('CourseFilesTab.Empty')} />
          )}
        </SectionList>
      </View>
      {recentFilesQuery.data?.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            title={'Navigate all files'}
            onPress={() => navigation.navigate('CourseDirectory', { courseId })}
          />
        </View>
      )}
    </ScrollView>
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
