import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { SectionList } from '@lib/ui/components/SectionList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { VideoPlayer } from '../../../core/components/VideoPlayer';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { formatDateWithTimeIfNotNull } from '../../../utils/dates';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVirtualClassroom'
>;

export const CourseVirtualClassroomScreen = ({ route }: Props) => {
  const { courseId, lectureId, teacherId } = route.params;
  const { t } = useTranslation();
  const virtualClassroomQuery = useGetCourseVirtualClassrooms(courseId);
  const teacherQuery = useGetPerson(teacherId);

  const lecture = useMemo(() => {
    return virtualClassroomQuery.data?.find(l => l.id === lectureId);
  }, [lectureId, virtualClassroomQuery.data]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl queries={[virtualClassroomQuery, teacherQuery]} />
      }
      contentContainerStyle={GlobalStyles.fillHeight}
    >
      {lecture?.videoUrl && (
        <VideoPlayer
          source={{ uri: lecture.videoUrl }}
          poster={lecture?.coverUrl ?? undefined}
        />
      )}
      <EventDetails
        title={lecture?.title ?? ''}
        type={t('courseVirtualClassroomScreen.title')}
        time={
          lecture?.createdAt
            ? formatDateWithTimeIfNotNull(lecture?.createdAt)
            : undefined
        }
      />
      <SectionList loading={teacherQuery.isLoading}>
        {teacherQuery.data && (
          <PersonListItem
            person={teacherQuery.data}
            subtitle={t('common.teacher')}
          />
        )}
      </SectionList>
    </ScrollView>
  );
};
