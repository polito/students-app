import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useGetCourseGuide } from '../hooks/courseHooks';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseGuide'>;

export const CourseGuideScreen = ({ route }: Props) => {
  const { courseId } = route.params;
  const { data: guideResponse } = useGetCourseGuide(courseId);

  return (
    <View>
      {guideResponse &&
        guideResponse.data.map((section, i) => (
          <View key={i}>
            <Text style={{ fontWeight: 'bold' }}>{section.title}</Text>
            <Text>{section.content}</Text>
          </View>
        ))}
    </View>
  );
};
