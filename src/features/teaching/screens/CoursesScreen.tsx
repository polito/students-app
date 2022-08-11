import { Text, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { useGetCourses } from '../hooks/CourseHooks';

export const CoursesScreen = () => {
  const { data: coursesResponse, isLoading: isCoursesLoading } =
    useGetCourses();

  return (
    <View>
      <Text>Courses</Text>
      {isCoursesLoading && <Text>Loading</Text>}
      {coursesResponse?.data.map(c => (
        <Link key={c.shortcode} to={{ screen: 'Course', params: { id: c.id } }}>
          <Text>{JSON.stringify(c)}</Text>
        </Link>
      ))}
    </View>
  );
};
