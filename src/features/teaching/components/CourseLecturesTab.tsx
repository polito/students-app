import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { TouchableCard } from '@lib/ui/components/TouchableCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  CourseAllOfVcOtherCourses,
  CourseAllOfVcPreviousYears,
} from '@polito-it/api-client';
import { useNavigation } from '@react-navigation/native';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourseVideolectures,
  useGetCourseVirtualClassrooms,
} from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

type CourseLecturesTabParameters = CourseTabProps & {
  vcPreviousYears: CourseAllOfVcPreviousYears[];
  vcOtherCourses: CourseAllOfVcOtherCourses[];
};

export const CourseLecturesTab = ({
  courseId,
  vcPreviousYears,
  vcOtherCourses,
}: CourseLecturesTabParameters) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { navigate } = useNavigation();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const videolecturesQuery = useGetCourseVideolectures(courseId);
  const virtualClassroomsQuery = useGetCourseVirtualClassrooms(courseId);

  return (
    <ScrollView
      style={[{ paddingVertical: spacing[5] }, bottomBarAwareStyles]}
      refreshControl={createRefreshControl(
        videolecturesQuery,
        virtualClassroomsQuery,
      )}
    >
      <SectionHeader title={t('Video lectures')} />
      <View style={{ padding: spacing[5] }}>
        {videolecturesQuery.data?.data.map(lecture => (
          <TouchableCard
            key={lecture.id}
            style={{ marginBottom: spacing[4] }}
            cardStyle={{ padding: spacing[5] }}
            onPress={() =>
              navigate({
                name: 'CourseVideolecture',
                params: { courseId, lectureId: lecture.id },
              })
            }
          >
            <View style={{ marginBottom: spacing[2] }}>
              <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
                {lecture.title}
              </Text>
              <Text variant="secondaryText">{lecture.teacherId}</Text>
            </View>
            <Text variant="secondaryText">
              {lecture.createdAt.toLocaleDateString()} ({lecture.duration})
            </Text>
          </TouchableCard>
        ))}
      </View>
      <SectionHeader title={t('Virtual classrooms')} />
      <View style={{ padding: spacing[5] }}>
        {virtualClassroomsQuery.data?.data.map(vc => (
          <TouchableCard
            key={vc.id}
            style={{ marginBottom: spacing[4] }}
            cardStyle={{ padding: spacing[5] }}
            onPress={() =>
              navigate({
                name: 'CourseVirtualClassroom',
                params: { courseId, lectureId: vc.id },
              })
            }
          >
            <View style={{ marginBottom: spacing[2] }}>
              <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
                {vc.title}
              </Text>
              <Text variant="secondaryText">{vc.teacherId}</Text>
            </View>
            <Text variant="secondaryText">
              {vc.createdAt.toLocaleDateString()} ({vc.duration})
            </Text>
          </TouchableCard>
        ))}
      </View>
    </ScrollView>
  );
};
