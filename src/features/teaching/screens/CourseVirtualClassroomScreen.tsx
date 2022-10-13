import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { VideoPlayer } from '@lib/ui/components/VideoPlayer';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVirtualClassroom'
>;

export const CourseVirtualClassroomScreen = ({ route }: Props) => {
  const { courseId, lectureId } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const virtualClassroomQuery = useGetCourseVirtualClassrooms(courseId);
  const lecture = virtualClassroomQuery.data?.data.find(
    l => l.id === lectureId,
  );
  const teacherQuery = useGetPerson(`${lecture.teacherId}`);

  return (
    <ScrollView
      contentContainerStyle={bottomBarAwareStyles}
      refreshControl={createRefreshControl(virtualClassroomQuery, teacherQuery)}
    >
      <VideoPlayer
        videoUrl="https://lucapezzolla.com/20210525.mp4"
        coverUrl={lecture.coverUrl}
      />
      <EventDetails
        title={lecture.title}
        type={t('Virtual classroom')}
        time={lecture.createdAt}
      />
      <SectionList loading={teacherQuery.isLoading}>
        {teacherQuery.data && (
          <PersonListItem
            person={teacherQuery.data?.data}
            subtitle={t('Course holder')}
          />
        )}
      </SectionList>
    </ScrollView>
  );
};
