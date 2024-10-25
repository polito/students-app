import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  ParamListBase,
  StackNavigationState,
  TypedNavigator,
} from '@react-navigation/native';
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { CourseAssignmentPdfCreationScreen } from '../screens/CourseAssignmentPdfCreationScreen';
import { CourseAssignmentUploadConfirmationScreen } from '../screens/CourseAssignmentUploadConfirmationScreen';
import { CourseAssignmentUploadScreen } from '../screens/CourseAssignmentUploadScreen';
import { CourseDirectoryScreen } from '../screens/CourseDirectoryScreen';
import { CourseGuideScreen } from '../screens/CourseGuideScreen';
import { CourseIconPickerScreen } from '../screens/CourseIconPickerScreen';
import { CoursePreferencesScreen } from '../screens/CoursePreferencesScreen';
import { CourseVideolectureScreen } from '../screens/CourseVideolectureScreen';
import { CourseVirtualClassroomScreen } from '../screens/CourseVirtualClassroomScreen';
import { NoticeScreen } from '../screens/NoticeScreen';
import { Assignment } from '../types/Assignment';
import { CourseNavigator } from './CourseNavigator';

export interface CourseSharedScreensParamList extends ParamListBase {
  Course: { id: number; animated?: boolean };
  Notice: { noticeId: number; courseId: number };
  CoursePreferences: { courseId: number; uniqueShortcode: string };
  CourseGuide: { courseId: number };
  CourseDirectory: {
    courseId: number;
    directoryId?: string;
    directoryName?: string;
  };
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
}

export const CourseSharedScreens = (
  Stack: TypedNavigator<
    CourseSharedScreensParamList,
    StackNavigationState<ParamListBase>,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    any
  >,
) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen
        name="Course"
        component={CourseNavigator}
        getId={({ params }) => `${params.id}`}
        options={({ route: { params } }) => ({
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: params?.animated ?? true ? 'default' : 'none',
        })}
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
        getId={({ params }) => `${params?.directoryId}`}
        options={{
          headerBackTitleVisible: false,
          headerLargeTitle: false,
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
    </>
  );
};
