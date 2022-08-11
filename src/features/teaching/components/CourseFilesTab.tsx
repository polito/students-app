import { Text, View } from 'react-native';
import { useGetCourseFiles } from '../hooks/CourseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseFilesTab = ({ courseId }: CourseTabProps) => {
  const { data: filesResponse } = useGetCourseFiles(courseId);

  return (
    <View>
      <Text>{filesResponse && JSON.stringify(filesResponse.data)}</Text>
    </View>
  );
};
