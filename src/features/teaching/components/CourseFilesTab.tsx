import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { CourseFileOverview } from '@polito-it/api-client';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseFiles } from '../../../core/queries/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { CourseFileListItem } from './CourseFileListItem';

export const CourseFilesTab = ({ courseId, navigation }: CourseTabProps) => {
  const { t } = useTranslation();

  const filesQuery = useGetCourseFiles(courseId);
  const [recentFiles, setRecentFiles] = useState<CourseFileOverview[]>([]);

  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);

  useEffect(() => {
    if (!filesQuery.isFetched) return;

    setRecentFiles(filesQuery.data.data.filter(f => f.type === 'file'));
  }, [filesQuery.isFetched]);

  return (
    <ScrollView
      style={bottomBarAwareStyles}
      refreshControl={createRefreshControl(filesQuery)}
    >
      <View style={styles.sectionContainer}>
        <SectionHeader title={t('Most recent files')} />
        <SectionList loading={filesQuery.isLoading}>
          {recentFiles.map((file, index) => (
            <CourseFileListItem
              key={file.id}
              item={file}
              isDownloaded={index % 3 === 0}
            />
          ))}
        </SectionList>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={'Navigate all files'}
          onPress={() =>
            navigation.navigate('CourseDirectoryRoot', { courseId })
          }
        />
      </View>
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
  });
