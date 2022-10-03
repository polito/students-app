import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { VideoPlayer } from '@lib/ui/components/VideoPlayer';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseVideolectures } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVideolecture'
>;

export const CourseVideolectureScreen = ({ route }: Props) => {
  const { courseId, lectureId } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const videolecturesQuery = useGetCourseVideolectures(courseId);
  const lecture = videolecturesQuery.data?.data.find(l => l.id === lectureId);
  const teacherQuery = useGetPerson(`${lecture.teacherId}`);

  return (
    <ScrollView
      contentContainerStyle={bottomBarAwareStyles}
      refreshControl={createRefreshControl(teacherQuery, videolecturesQuery)}
    >
      <VideoPlayer
        videoUrl="https://lucapezzolla.com/20210525.mp4"
        coverUrl={lecture.coverUrl}
      />
      <EventDetails
        title={lecture.title}
        type={t('Video lecture')}
        time={lecture.createdAt}
      />
      <SectionList loading={teacherQuery.isLoading}>
        {teacherQuery.data && (
          <ListItem
            leadingItem={
              <Ionicons
                name="person"
                style={{ color: colors.secondaryText, marginRight: spacing[4] }}
                size={fontSizes['2xl']}
              />
            }
            title={`${teacherQuery.data.data.firstName} ${teacherQuery.data.data.lastName}`}
            subtitle={t('Course holder')}
          />
        )}
      </SectionList>
    </ScrollView>
  );
};
