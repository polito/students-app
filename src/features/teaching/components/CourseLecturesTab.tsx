import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableHighlight, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
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
  const { colors, spacing } = useTheme();
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
      <Grid style={{ padding: spacing[5] }}>
        {videolecturesQuery.data?.data.map(lecture => (
          <TouchableHighlight
            key={lecture.id}
            style={{ flex: 1 }}
            onPress={() =>
              navigate({
                name: 'CourseVideolecture',
                params: { courseId, lectureId: lecture.id },
              })
            }
          >
            <Card style={{ padding: spacing[5] }}>
              {lecture.coverUrl ? (
                <Image
                  source={{ uri: lecture.coverUrl }}
                  resizeMode="cover"
                  style={{
                    marginTop: -spacing[5],
                    marginHorizontal: -spacing[5],
                    marginBottom: spacing[3],
                    height: 110,
                  }}
                />
              ) : (
                <Ionicons
                  name="videocam-outline"
                  size={36}
                  color={colors.secondaryText}
                  style={{ alignSelf: 'center', margin: spacing[8] }}
                />
              )}
              <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
                {lecture.title}
              </Text>
              <Text variant="secondaryText">
                {lecture.createdAt.toLocaleDateString()}
              </Text>
            </Card>
          </TouchableHighlight>
        ))}
      </Grid>
      <SectionHeader title={t('Virtual classrooms')} />
      <Grid style={{ padding: spacing[5] }}>
        {virtualClassroomsQuery.data?.data.map(vc => (
          <TouchableHighlight
            key={vc.id}
            style={{ flex: 1 }}
            onPress={() =>
              navigate({
                name: 'CourseVirtualClassroom',
                params: { courseId, lectureId: vc.id },
              })
            }
          >
            <Card style={{ padding: spacing[5], overflow: 'hidden' }}>
              {vc.coverUrl ? (
                <Image
                  source={{ uri: vc.coverUrl }}
                  resizeMode="cover"
                  style={{
                    marginTop: -spacing[5],
                    marginHorizontal: -spacing[5],
                    marginBottom: spacing[3],
                    height: 110,
                  }}
                />
              ) : (
                <Ionicons
                  name="videocam-outline"
                  size={36}
                  color={colors.secondaryText}
                  style={{ alignSelf: 'center', margin: spacing[8] }}
                />
              )}
              <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
                {vc.title}
              </Text>
              <Text variant="secondaryText">
                {vc.createdAt.toLocaleDateString()}
              </Text>
            </Card>
          </TouchableHighlight>
        ))}
      </Grid>
    </ScrollView>
  );
};
