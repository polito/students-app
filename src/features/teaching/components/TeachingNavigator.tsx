import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { OnboardingModal } from '../../../core/screens/OnboardingModal';
import { CourseNavigator } from '../../courses/navigation/CourseNavigator';
import { CourseAssignmentPdfCreationScreen } from '../../courses/screens/CourseAssignmentPdfCreationScreen';
import { CourseAssignmentUploadConfirmationScreen } from '../../courses/screens/CourseAssignmentUploadConfirmationScreen';
import { CourseAssignmentUploadScreen } from '../../courses/screens/CourseAssignmentUploadScreen';
import { CourseDirectoryScreen } from '../../courses/screens/CourseDirectoryScreen';
import { CourseGuideScreen } from '../../courses/screens/CourseGuideScreen';
import { CourseIconPickerScreen } from '../../courses/screens/CourseIconPickerScreen';
import { CoursePreferencesScreen } from '../../courses/screens/CoursePreferencesScreen';
import { CourseVideolectureScreen } from '../../courses/screens/CourseVideolectureScreen';
import { CourseVirtualClassroomScreen } from '../../courses/screens/CourseVirtualClassroomScreen';
import { CoursesScreen } from '../../courses/screens/CoursesScreen';
import { NoticeScreen } from '../../courses/screens/NoticeScreen';
import { Assignment } from '../../courses/types/Assignment';
import { PersonScreen } from '../../people/screens/PersonScreen';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { ExamQuestionScreen } from '../screens/ExamQuestionScreen';
import { ExamRequestScreen } from '../screens/ExamRequestScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { TeachingScreen } from '../screens/TeachingScreen';
import { TranscriptScreen } from '../screens/TranscriptScreen';

export interface TeachingStackParamList extends ParamListBase {
  Home: undefined;
  Courses: undefined;
  Course: { id: number };
  Notice: { noticeId: number; courseId: number };
  Person: { id: number };
  CoursePreferences: { courseId: number; uniqueShortcode: string };
  CourseDirectory: {
    courseId: number;
    directoryId?: string;
    directoryName?: string;
  };
  CourseGuide: { courseId: number };
  CourseVideolecture: {
    courseId: number;
    lectureId: number;
    teacherId: number;
  };
  CourseVirtualClassroom: {
    courseId: number;
    lectureId: number;
    teacherId: number;
  };
  CourseAssignmentPdfCreation: { courseId: number; firstImageUri: string };
  CourseAssignmentUpload: { courseId: number };
  CourseAssignmentUploadConfirmation: { courseId: number; file: Assignment };
  CourseIconPicker: { courseId: number; uniqueShortcode: string };
  Exams: undefined;
  Exam: { id: number };
  ExamQuestion: { id: number };
  ExamRequest: { id: number };
  MessagesModal: undefined;
  Transcript: undefined;
  OnboardingModal: undefined;
}

const Stack = createNativeStackNavigator<TeachingStackParamList>();

export const TeachingNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      id="TeachingTabNavigator"
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...useTitlesStyles(theme),
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
        component={CourseNavigator}
        getId={({ params }) => `${params.id}`}
        options={{
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Notice"
        component={NoticeScreen}
        getId={({ params }) => `${params.courseId}${params.noticeId}`}
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('common.notice'),
        }}
      />
      <Stack.Screen
        name="CoursePreferences"
        component={CoursePreferencesScreen}
        getId={({ params }) => `${params.courseId}`}
        options={{
          title: t('common.preferences'),
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="CourseIconPicker"
        component={CourseIconPickerScreen}
        getId={({ params }) => `${params.courseId}`}
        options={{
          title: t('courseIconPickerScreen.title'),
          headerLargeTitle: false,
          headerSearchBarOptions: {},
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
        getId={({ params }) => `${params.courseId}`}
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="CourseVideolecture"
        component={CourseVideolectureScreen}
        getId={({ params }) => `${params.courseId}${params.lectureId}`}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('common.videoLecture'),
        }}
      />
      <Stack.Screen
        name="CourseVirtualClassroom"
        component={CourseVirtualClassroomScreen}
        getId={({ params }) => `${params.courseId}${params.lectureId}`}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('courseVirtualClassroomScreen.title'),
        }}
      />
      <Stack.Screen
        name="CourseAssignmentPdfCreation"
        component={CourseAssignmentPdfCreationScreen}
        getId={({ params }) => `${params.courseId}`}
        options={{
          headerBackTitleVisible: false,
          headerTitle: t('courseAssignmentPdfCreationScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="CourseAssignmentUpload"
        component={CourseAssignmentUploadScreen}
        getId={({ params }) => `${params.courseId}`}
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('courseAssignmentUploadScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="CourseAssignmentUploadConfirmation"
        component={CourseAssignmentUploadConfirmationScreen}
        getId={({ params }) => `${params.courseId}`}
        options={{
          headerBackTitle: t('courseAssignmentUploadScreen.backTitle'),
          headerTitle: t('courseAssignmentUploadScreen.title'),
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          headerTitle: t('common.examCall_plural'),
        }}
      />
      <Stack.Screen
        name="Exam"
        component={ExamScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
      <Stack.Screen
        name="ExamQuestion"
        component={ExamQuestionScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
      <Stack.Screen
        name="ExamRequest"
        component={ExamRequestScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
      <Stack.Screen
        name="Transcript"
        component={TranscriptScreen}
        options={{
          headerTitle: t('common.transcript'),
        }}
      />
      <Stack.Screen
        name="MessagesModal"
        component={UnreadMessagesModal}
        options={{
          headerTitle: t('messagesScreen.title'),
          headerLargeTitle: false,
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <Stack.Screen
        name="OnboardingModal"
        component={OnboardingModal}
        options={{
          headerTitle: t('onboardingScreen.title'),
          headerLargeTitle: false,
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <Stack.Screen
        name="Person"
        component={PersonScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
