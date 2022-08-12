import { Text, View } from 'react-native';
import {
  CourseAllOfVcOtherCourses,
  CourseAllOfVcPreviousYears,
} from '@polito-it/api-client';
import { Link } from '@react-navigation/native';
import {
  useGetCourseVideolectures,
  useGetCourseVirtualClassrooms,
} from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

type CourseLecturesTabParameters = CourseTabProps & {
  vcPreviousYears: CourseAllOfVcPreviousYears[];
  vcOtherCourses: CourseAllOfVcOtherCourses[];
};

export const CourseLecturesTab = ({
  courseId,
  vcPreviousYears,
  vcOtherCourses,
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
