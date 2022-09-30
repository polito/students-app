import { View } from 'react-native';

import { VideoPlayer } from '@lib/ui/components/VideoPlayer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVirtualClassroom'
>;

export const CourseVirtualClassroomScreen = ({ route }: Props) => {
  const { courseId, lectureId } = route.params;

  const { data: virtualClassroomsResponse } =
    useGetCourseVirtualClassrooms(courseId);

  const lecture = virtualClassroomsResponse?.data.find(l => l.id === lectureId);

  return (
    <View>
      <VideoPlayer
        videoUrl="https://lucapezzolla.com/20210525.mp4"
        coverUrl={lecture.coverUrl}
      />
    </View>
  );
};
