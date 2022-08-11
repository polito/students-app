import { Text, View } from 'react-native';
import { useGetCourseNotices } from '../hooks/CourseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseNoticesTab = ({ courseId }: CourseTabProps) => {
  const { data: noticesResponse } = useGetCourseNotices(courseId);

  return (
    <View>
      <Text>{noticesResponse && JSON.stringify(noticesResponse.data)}</Text>
    </View>
  );
};
