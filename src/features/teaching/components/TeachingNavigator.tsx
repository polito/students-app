import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { CourseAssignmentPdfCreationScreen } from '../screens/CourseAssignmentPdfCreationScreen';
import { CourseAssignmentUploadConfirmationScreen } from '../screens/CourseAssignmentUploadConfirmationScreen';
import { CourseAssignmentUploadScreen } from '../screens/CourseAssignmentUploadScreen';
import { CourseDirectoryScreen } from '../screens/CourseDirectoryScreen';
import { CourseGuideScreen } from '../screens/CourseGuideScreen';
import { CourseIconPickerScreen } from '../screens/CourseIconPickerScreen';
import { CoursePreferencesScreen } from '../screens/CoursePreferencesScreen';
import { CourseVideolectureScreen } from '../screens/CourseVideolectureScreen';
import { CourseVirtualClassroomScreen } from '../screens/CourseVirtualClassroomScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ExamQuestionScreen } from '../screens/ExamQuestionScreen';
import { ExamRequestScreen } from '../screens/ExamRequestScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { NoticeScreen } from '../screens/NoticeScreen';
import { PersonScreen } from '../screens/PersonScreen';
import { TeachingScreen } from '../screens/TeachingScreen';
import { TranscriptScreen } from '../screens/TranscriptScreen';
import { Assignment } from '../types/Assignment';
import { CourseNavigator } from './CourseNavigator';

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
  CourseIconPicker: { uniqueShortcode: string };
  Exams: undefined;
  Exam: { id: number };
  ExamQuestion: { id: number };
  ExamRequest: { id: number };
  MessagesModal: undefined;
  Transcript: undefined;
}

const Stack = createNativeStackNavigator<TeachingStackParamList>();

export const TeachingNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
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
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('common.notice'),
        }}
      />
      <Stack.Screen
        name="CoursePreferences"
        component={CoursePreferencesScreen}
        options={{
          title: t('common.preferences'),
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="CourseIconPicker"
        component={CourseIconPickerScreen}
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
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="CourseVideolecture"
        component={CourseVideolectureScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('common.videoLecture'),
        }}
      />
      <Stack.Screen
        name="CourseVirtualClassroom"
        component={CourseVirtualClassroomScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('courseVirtualClassroomScreen.title'),
        }}
      />
      <Stack.Screen
        name="CourseAssignmentPdfCreation"
        component={CourseAssignmentPdfCreationScreen}
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
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('courseAssignmentUploadScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="CourseAssignmentUploadConfirmation"
        component={CourseAssignmentUploadConfirmationScreen}
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
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
      <Stack.Screen
        name="ExamQuestion"
        component={ExamQuestionScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
      <Stack.Screen
        name="ExamRequest"
        component={ExamRequestScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
      <Stack.Screen
        name="Person"
        component={PersonScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
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
    </Stack.Navigator>
  );
};
