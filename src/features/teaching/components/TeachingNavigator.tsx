import { useTranslation } from 'react-i18next';
import { createStackNavigator } from '@react-navigation/stack';
import { CourseAssignmentUploadScreen } from '../screens/CourseAssignmentUploadScreen';
import { CourseGuideScreen } from '../screens/CourseGuideScreen';
import { CourseScreen } from '../screens/CourseScreen';
import { CourseVideolectureScreen } from '../screens/CourseVideolectureScreen';
import { CourseVirtualClassroomScreen } from '../screens/CourseVirtualClassroomScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { GradesScreen } from '../screens/GradesScreen';
import { HomeScreen } from '../screens/HomeScreen';

export type TeachingStackParamList = {
  Home: undefined;
  Courses: undefined;
  Course: { id: number };
  CourseGuide: { courseId: number };
  CourseVideolecture: { courseId: number; lectureId: number };
  CourseVirtualClassroom: { courseId: number; lectureId: number };
  CourseAssignmentUpload: { courseId: number };
  Exams: undefined;
  Exam: { id: number };
  Grades: undefined;
};

const Stack = createStackNavigator<TeachingStackParamList>();

export const TeachingNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: t('Teaching'),
        }}
      />
      <Stack.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          headerTitle: t('Courses'),
        }}
      />
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen name="CourseGuide" component={CourseGuideScreen} />
      <Stack.Screen
        name="CourseVideolecture"
        component={CourseVideolectureScreen}
      />
      <Stack.Screen
        name="CourseVirtualClassroom"
        component={CourseVirtualClassroomScreen}
      />
      <Stack.Screen
        name="CourseAssignmentUpload"
        component={CourseAssignmentUploadScreen}
      />

      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          headerTitle: t('Exams'),
        }}
      />
      <Stack.Screen name="Exam" component={ExamScreen} />

      <Stack.Screen
        name="Grades"
        component={GradesScreen}
        options={{
          headerTitle: t('Transcript'),
        }}
      />
    </Stack.Navigator>
  );
};
