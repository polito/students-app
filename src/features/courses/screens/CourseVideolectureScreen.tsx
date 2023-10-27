import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { EventDetails } from '../../../core/components/EventDetails';
import { VideoPlayer } from '../../../core/components/VideoPlayer';
import { useGetCourseVideolectures } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatDateWithTimeIfNotNull } from '../../../utils/dates';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVideolecture'
>;

export const CourseVideolectureScreen = ({ route }: Props) => {
  const { courseId, lectureId, teacherId } = route.params;
  const { t } = useTranslation();
  const videolecturesQuery = useGetCourseVideolectures(courseId);
  const teacherQuery = useGetPerson(teacherId);

  const lecture = useMemo(() => {
    return videolecturesQuery.data?.find(l => l.id === lectureId);
  }, [lectureId, videolecturesQuery.data]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl queries={[teacherQuery, videolecturesQuery]} manual />
      }
      contentContainerStyle={GlobalStyles.fillHeight}
    >
      <SafeAreaView>
        <VideoPlayer
          source={{ uri: lecture?.videoUrl }}
          poster={lecture?.coverUrl}
        />
        <EventDetails
          title={lecture?.title ?? ''}
          type={t('common.videoLecture')}
          time={
            lecture?.createdAt
              ? formatDateWithTimeIfNotNull(lecture?.createdAt)
              : undefined
          }
        />
        <OverviewList loading={teacherQuery.isLoading}>
          {teacherQuery.data && (
            <PersonListItem
              person={teacherQuery.data}
              subtitle={t('common.teacher')}
              isCrossNavigation={true}
            />
          )}
        </OverviewList>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
