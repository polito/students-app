/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { titlesStyles } from '@core/hooks/titlesStyles';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { AssignmentPdfCreation } from './AssignmentPdfCreation';
import { AssignmentUpload } from './AssignmentUpload';
import { AssignmentUploadConfirmation } from './AssignmentUploadConfirmation';
import { Course } from './Course';
import { Courses } from './Courses';
import { Directory } from './Directory';
import { Guide } from './Guide';
import { IconPicker } from './IconPicker';
import { Notice } from './Notice';
import { Preferences } from './Preferences';
import { Videolecture } from './Videolecture';
import { VirtualClassroom } from './VirtualClassroom';

export type CoursesStackParamList = {
  Courses: undefined;
  Course: { id: number; courseName: string };
  Notice: { noticeId: number; courseId: number };
  // Person: { id: number };
  Preferences: { courseId: number };
  Directory: {
    courseId: number;
    directoryId?: string;
    directoryName?: string;
  };
  Guide: { courseId: number };
  Videolecture: {
    courseId: number;
    lectureId: number;
    teacherId: number;
  };
  VirtualClassroom: {
    courseId: number;
    lectureId: number;
    teacherId: number;
  };
  AssignmentPdfCreation: { courseId: number; firstImageUri: string };
  AssignmentUpload: { courseId: number };
  AssignmentUploadConfirmation: { courseId: number; fileUri: string };
  IconPicker: { courseId: number };
};

export const createCoursesScreens = <T extends CoursesStackParamList>(
  Stack: ReturnType<typeof createNativeStackNavigator<T>>,
) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Group
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...titlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Courses"
        component={Courses}
        options={{
          headerTitle: t('coursesScreen.title'),
        }}
      />
      <Stack.Screen
        name="Course"
        component={Course}
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
        component={Notice}
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('common.notice'),
        }}
      />
      <Stack.Screen
        name="Preferences"
        component={Preferences}
        options={{
          title: t('common.preferences'),
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="IconPicker"
        component={IconPicker}
        options={{
          title: t('courseIconPickerScreen.title'),
          headerLargeTitle: false,
          headerSearchBarOptions: {},
        }}
      />
      <Stack.Screen
        name="Directory"
        component={Directory}
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
        name="Guide"
        component={Guide}
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="Videolecture"
        component={Videolecture}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('common.videoLecture'),
        }}
      />
      <Stack.Screen
        name="VirtualClassroom"
        component={VirtualClassroom}
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('courseVirtualClassroomScreen.title'),
        }}
      />
      <Stack.Screen
        name="AssignmentPdfCreation"
        component={AssignmentPdfCreation}
        options={{
          headerBackTitleVisible: false,
          headerTitle: t('courseAssignmentPdfCreationScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="AssignmentUpload"
        component={AssignmentUpload}
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('courseAssignmentUploadScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="AssignmentUploadConfirmation"
        component={AssignmentUploadConfirmation}
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
    </Stack.Group>
  );
};
