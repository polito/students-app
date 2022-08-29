import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
  Course: { id: number; courseName: string };
  CourseGuide: { courseId: number };
  CourseVideolecture: { courseId: number; lectureId: number };
  CourseVirtualClassroom: { courseId: number; lectureId: number };
  CourseAssignmentUpload: { courseId: number };
  Exams: undefined;
  Exam: { id: number };
  Grades: undefined;
};

const Stack = createNativeStackNavigator<TeachingStackParamList>();

export const TeachingNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerLargeTitleStyle: {
          fontFamily: 'Poppins-semibold',
          color: colors.heading,
        },
        headerBlurEffect: 'regular',
        headerTitleStyle: {
          fontFamily: 'Poppins-semibold',
          color: colors.heading,
        },
        headerBackTitleStyle: {
          fontFamily: 'Poppins-normal',
        },
      }}
    >
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
      <Stack.Screen
        name="Course"
        component={CourseScreen}
        options={{
          headerLargeStyle: {
            backgroundColor: colors.surface,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
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
