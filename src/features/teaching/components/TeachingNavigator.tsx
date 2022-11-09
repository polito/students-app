import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { CourseAssignmentUploadScreen } from '../screens/CourseAssignmentUploadScreen';
import { CourseDirectoryScreen } from '../screens/CourseDirectoryScreen';
import { CourseGuideScreen } from '../screens/CourseGuideScreen';
import { CoursePreferencesScreen } from '../screens/CoursePreferencesScreen';
import { CourseScreen } from '../screens/CourseScreen';
import { CourseVideolectureScreen } from '../screens/CourseVideolectureScreen';
import { CourseVirtualClassroomScreen } from '../screens/CourseVirtualClassroomScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { TeachingScreen } from '../screens/TeachingScreen';
import { TranscriptScreen } from '../screens/TranscriptScreen';

export type TeachingStackParamList = {
  Home: undefined;
  Courses: undefined;
  Course: { id: number; courseName: string };
  CoursePreferences: { courseId: number };
  CourseDirectory: { courseId: number; directoryId?: string };
  CourseGuide: { courseId: number };
  CourseVideolecture: { courseId: number; lectureId: number };
  CourseVirtualClassroom: { courseId: number; lectureId: number };
  CourseAssignmentUpload: { courseId: number };
  Exams: undefined;
  Exam: { id: number };
  Transcript: undefined;
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
        headerBlurEffect: 'regular',
        ...titlesStyles(colors),
      }}
    >
      <Stack.Screen
        name="Home"
        component={TeachingScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('teachingScreen.title'),
        }}
      />
      <Stack.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          headerTitle: t('coursesScreen.title'),
        }}
      />
      <Stack.Screen
        name="Course"
        component={CourseScreen}
        options={{
          headerLargeStyle: {
            backgroundColor: colors.headers,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CoursePreferences"
        component={CoursePreferencesScreen}
        options={{
          title: t('Preferences'),
          headerLargeTitle: false,
          headerBackTitle: t('Course'),
        }}
      />
      <Stack.Screen
        name="CourseDirectory"
        component={CourseDirectoryScreen}
        getId={({ params }) => `${params.directoryId}`}
        options={{
          headerBackTitleVisible: false,
          headerLargeTitle: false,
          headerSearchBarOptions: {
            hideWhenScrolling: false,
          },
        }}
      />

      <Stack.Screen
        name="CourseGuide"
        component={CourseGuideScreen}
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitle: t('courseScreen.title'),
        }}
      />
      <Stack.Screen
        name="CourseVideolecture"
        component={CourseVideolectureScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('courseScreen.title'),
          title: t('Video lecture'),
        }}
      />
      <Stack.Screen
        name="CourseVirtualClassroom"
        component={CourseVirtualClassroomScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('courseScreen.title'),
          title: t('courseVirtualClassroomScreen.title'),
        }}
      />
      <Stack.Screen
        name="CourseAssignmentUpload"
        component={CourseAssignmentUploadScreen}
        options={{
          headerBackTitle: t('courseScreen.title'),
          headerTitle: t('courseAssignmentUploadScreen.title'),
        }}
      />

      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          headerTitle: t('examsScreen.title'),
        }}
      />
      <Stack.Screen
        name="Exam"
        component={ExamScreen}
        options={{
          headerLargeTitle: false,
        }}
      />

      <Stack.Screen
        name="Transcript"
        component={TranscriptScreen}
        options={{
          headerTitle: t('Transcript'),
        }}
      />
    </Stack.Navigator>
  );
};
