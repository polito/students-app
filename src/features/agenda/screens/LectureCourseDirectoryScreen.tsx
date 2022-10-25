import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { CourseDirectory, CourseFileOverview } from '@polito-it/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { CourseDirectoryListItem } from '../../teaching/components/CourseDirectoryListItem';
import { CourseFileListItem } from '../../teaching/components/CourseFileListItem';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<
  AgendaStackParamList,
  'LectureCourseDirectory'
>;

export const LectureCourseDirectoryScreen = ({ route, navigation }: Props) => {
  const { courseId } = route.params;

  const directoryQuery = useGetCourseDirectory(courseId);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const [directoryContent, setDirectoryContent] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: e => setSearchFilter(e.nativeEvent.text),
      },
    });
  }, []);

  useEffect(() => {
    if (!directoryQuery.data) return;

    navigation.setOptions({
      headerTitle: directoryQuery.data.name,
    });
    setDirectoryContent(directoryQuery.data.files);
  }, [directoryQuery.data]);

  useEffect(() => {
    // If the search filter is empty
    if (!searchFilter) {
      // If no filter was applied
      if (!isFiltered) return;

      // Else, reset screen directory content
      setDirectoryContent(directoryQuery.data.files);
      setIsFiltered(false);
      return;
    }

    // Search filter is nonempty
    setIsFiltered(true);
    setDirectoryContent(
      recentFilesQuery.data.filter(file => file.name.includes(searchFilter)),
    );
  }, [searchFilter]);

  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={directoryContent}
      keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
      renderItem={({ item, index }) =>
        item.type === 'directory' ? (
          <CourseDirectoryListItem item={item} courseId={courseId} />
        ) : (
          <CourseFileListItem item={item} isDownloaded={index % 2 === 0} />
        )
      }
      refreshControl={createRefreshControl(directoryQuery)}
      refreshing={directoryQuery.isLoading}
      contentContainerStyle={bottomBarAwareStyles}
      ListEmptyComponent={
        <Text style={styles.noResultText}>
          {t('CourseDirectoryScreen.EmptySearch')}
        </Text>
      }
    />
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    noResultText: {
      padding: spacing[4],
    },
  });
