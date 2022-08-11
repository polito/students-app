import { Text, View } from 'react-native';
import { useGetCourseAssignments } from '../hooks/CourseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseAssignmentsTab = ({ courseId }: CourseTabProps) => {
  const { data: assignmentsResponse } = useGetCourseAssignments(courseId);

  return (
    <View>
      <Text>
        {assignmentsResponse && JSON.stringify(assignmentsResponse.data)}
      </Text>
    </View>
  );
};
