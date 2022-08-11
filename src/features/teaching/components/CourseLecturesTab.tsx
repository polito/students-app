import { Text, View } from 'react-native';
import { CourseAllOfOtherEditions } from '@polito-it/api-client/models/CourseAllOfOtherEditions';
import { CourseAllOfVcCourses } from '@polito-it/api-client/models/CourseAllOfVcCourses';
import { Link } from '@react-navigation/native';
import {
  useGetCourseVideolectures,
  useGetCourseVirtualClassrooms,
} from '../hooks/CourseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

type CourseLecturesTabParameters = CourseTabProps & {
  otherEditions: CourseAllOfOtherEditions[];
  vcCourses: CourseAllOfVcCourses[];
};

export const CourseLecturesTab = ({
  courseId,
  otherEditions,
  vcCourses,
}: CourseLecturesTabParameters) => {
  const { data: videolecturesResponse } = useGetCourseVideolectures(courseId);
  const { data: virtualClassroomsResponse } =
    useGetCourseVirtualClassrooms(courseId);

  return (
    <View>
      <Text style={{ fontWeight: 'bold' }}>Videolectures</Text>
      <View>
        {videolecturesResponse &&
          videolecturesResponse.data.map(lecture => (
            <Link
              to={{
                screen: 'CourseVideolecture',
                params: { courseId, lectureId: lecture.id },
              }}
              key={lecture.id}
            >
              {lecture.title}
            </Link>
          ))}
      </View>
      <Text style={{ fontWeight: 'bold' }}>Virtual classrooms</Text>
      <View>
        {virtualClassroomsResponse &&
          virtualClassroomsResponse.data.map(lecture => (
            <Link
              to={{
                screen: 'CourseVirtualClassroom',
                params: { courseId, lectureId: lecture.id },
              }}
              key={lecture.id}
            >
              {lecture.title}
            </Link>
          ))}
      </View>
    </View>
  );
};
