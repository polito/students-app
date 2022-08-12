import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useGetCourseVirtualClassrooms } from '../hooks/courseHooks';

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
      <Text>{lecture && JSON.stringify(lecture)}</Text>
    </View>
  );
};
