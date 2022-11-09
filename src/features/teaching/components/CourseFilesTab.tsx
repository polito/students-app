import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { List } from '@lib/ui/components/List';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
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
    <>
      <ScrollView
        contentContainerStyle={bottomBarAwareStyles}
        refreshControl={createRefreshControl(recentFilesQuery)}
      >
        <View style={styles.sectionContainer}>
          <SectionHeader
            title={t('courseFilesTab.recentSectionTitle')}
            separator={false}
          />
          <List indented>
            {recentFilesQuery.data?.slice(0, 5).map((file, index) => (
              <CourseRecentFileListItem key={file.id} item={file} />
            ))}
            {recentFilesQuery.data?.length === 0 && (
              <ListItem title={t('courseFilesTab.empty')} />
            )}
          </List>
        </View>
      </ScrollView>
      {recentFilesQuery.data?.length > 0 && (
        <CtaButton
          title={t('courseFilesTab.browseFiles')}
          onPress={() => navigation.navigate('CourseDirectory', { courseId })}
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
