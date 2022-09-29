import { Text, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetCourseVideolectures } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseVideolecture'
>;

export const CourseVideolectureScreen = ({ route }: Props) => {
  const { courseId, lectureId } = route.params;

  const { data: videolecturesResponse } = useGetCourseVideolectures(courseId);

  const lecture = videolecturesResponse?.data.find(l => l.id === lectureId);
  return (
    <View>
      <Text>{lecture && JSON.stringify(lecture)}</Text>
    </View>
  );
};
