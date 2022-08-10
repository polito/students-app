import { Text, View } from 'react-native';
import { useGetCourseOverview } from '../hooks/CourseHooks';

export const CourseScreen = ({ route }) => {
  const { id } = route.params;
  const { data: overviewResponse, isLoading: isCourseLoading } =
    useGetCourseOverview(id);

  return (
    <View>
      {isCourseLoading && <Text>Loading</Text>}
      <Text>
        Course: {overviewResponse && JSON.stringify(overviewResponse.data)}
      </Text>
    </View>
  );
};
