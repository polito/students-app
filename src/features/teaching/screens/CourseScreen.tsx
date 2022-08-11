import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CourseLecturesTab } from '../components/CourseLecturesTab';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useGetCourse } from '../hooks/CourseHooks';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Course'>;

export type CourseTabProps = {
  courseId: number;
};

export const CourseScreen = ({ route }: Props) => {
  const { id } = route.params;
  const { data: overviewResponse, isLoading: isCourseLoading } =
    useGetCourse(id);

  const renderedTab = overviewResponse && (
    <CourseLecturesTab
      courseId={id}
      vcPreviousYears={overviewResponse.data.vcPreviousYears}
      vcOtherCourses={overviewResponse.data.vcOtherCourses}
    ></CourseLecturesTab>
  );

  return (
    <View>
      {isCourseLoading && <Text>Loading</Text>}
      <Text>
        Course: {overviewResponse && JSON.stringify(overviewResponse.data)}
      </Text>
      {renderedTab}
    </View>
  );
};
