import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Logo } from '../../../core/components/Logo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { CourseAssignmentUploadScreen } from '../screens/CourseAssignmentUploadScreen';
import { CourseDirectoryRootScreen } from '../screens/CourseDirectoryRootScreen';
import { CourseDirectoryScreen } from '../screens/CourseDirectoryScreen';
import { CourseGuideScreen } from '../screens/CourseGuideScreen';
import { CourseScreen } from '../screens/CourseScreen';
import { CourseVideolectureScreen } from '../screens/CourseVideolectureScreen';
import { CourseVirtualClassroomScreen } from '../screens/CourseVirtualClassroomScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TranscriptScreen } from '../screens/TranscriptScreen';

export type TeachingStackParamList = {
  Home: undefined;
  Courses: undefined;
  Course: { id: number; courseName: string };
  CourseDirectory: { courseId: number; directoryId: string };
  CourseDirectoryRoot: { courseId: number };
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
        component={HomeScreen}
        options={{
          headerLeft: () => <Logo />,
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
      <Stack.Screen
        name="CourseDirectory"
        component={CourseDirectoryScreen}
        getId={({ params }) => `${params.directoryId}`}
        options={{
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CourseDirectoryRoot"
        component={CourseDirectoryRootScreen}
        options={{
          title: t('Files'),
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="CourseGuide"
        component={CourseGuideScreen}
        options={{
          headerTitle: t('Course guide'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CourseVideolecture"
        component={CourseVideolectureScreen}
        options={{
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CourseVirtualClassroom"
        component={CourseVirtualClassroomScreen}
        options={{
          headerLargeTitle: false,
          headerTransparent: false,
          headerBackTitleVisible: false,
        }}
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
        name="Transcript"
        component={TranscriptScreen}
        options={{
          headerTitle: t('Transcript'),
        }}
      />
    </Stack.Navigator>
  );
};
