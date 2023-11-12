import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
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
import { NoticeScreen } from '../../courses/screens/NoticeScreen';
import { DegreeCourseGuideScreen } from '../../offering/screens/DegreeCourseGuideScreen';
import { DegreeCourseScreen } from '../../offering/screens/DegreeCourseScreen';
import { PersonScreen } from '../../people/screens/PersonScreen';
import { PlacesNavigator } from '../../places/components/PlacesNavigator';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { ExamScreen } from '../../teaching/screens/ExamScreen';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { AgendaScreen } from '../screens/AgendaScreen';
import { AgendaWeekScreen } from '../screens/AgendaWeekScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DeadlineScreen } from '../screens/DeadlineScreen';
import { LectureScreen } from '../screens/LectureScreen';
import { DeadlineItem, LectureItem } from '../types/AgendaItem';

export type AgendaStackParamList = TeachingStackParamList & {
  Agenda: undefined;
  AgendaWeek: undefined;
  Lecture: { item: LectureItem };
  Deadline: { item: DeadlineItem };
  Booking: { id: number };
  DegreeCourse: {
    courseShortcode: string;
    year?: string;
  };
  DegreeCourseGuide: {
    courseShortcode: string;
    year?: string;
  };
};

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const {
    agendaScreen: { layout },
  } = usePreferencesContext();

  return (
    <Stack.Navigator
      id="AgendaTabNavigator"
      screenOptions={{
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...useTitlesStyles(theme),
      }}
      initialRouteName={layout === 'daily' ? 'Agenda' : 'AgendaWeek'}
    >
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          headerLargeTitle: false,
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('agendaScreen.title'),
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        }}
      />
      <Stack.Screen
        name="AgendaWeek"
        component={AgendaWeekScreen}
        options={{
          headerLargeTitle: false,
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('agendaScreen.title'),
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        }}
      />
      <Stack.Screen
        name="Lecture"
        component={LectureScreen}
        getId={({ params }) => `${params.item.courseId}${params.item.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.lecture'),
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
        name="Booking"
        component={BookingScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.booking'),
        }}
      />
      <Stack.Screen
        name="Deadline"
        component={DeadlineScreen}
        getId={({ params }) => `${params.item.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.deadline'),
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
        name="Person"
        component={PersonScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="DegreeCourse"
        component={DegreeCourseScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
        options={{
          headerTitle: t('degreeCourseScreen.title'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="DegreeCourseGuide"
        component={DegreeCourseGuideScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="PlacesStack"
        component={PlacesNavigator}
        options={{
          title: t('placeScreen.title'),
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
