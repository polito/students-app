import { Text, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseHomeTab = ({ courseId }: CourseTabProps) => {
  return (
    <View>
      <Text>Home</Text>
      <Link to={{ screen: 'CourseGuide', params: { courseId } }}>
        Go to guide
      </Link>
    </View>
  );
};
