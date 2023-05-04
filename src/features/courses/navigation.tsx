import { ScreenGroupType } from '@core/types/navigation';

import { AssignmentPdfCreation } from './screens/AssignmentPdfCreation';
import { AssignmentUpload } from './screens/AssignmentUpload';
import { AssignmentUploadConfirmation } from './screens/AssignmentUploadConfirmation';
import { Course } from './screens/Course';
import { Courses } from './screens/Courses';
import { Directory } from './screens/Directory';
import { Guide } from './screens/Guide';
import { IconPicker } from './screens/IconPicker';
import { Notice } from './screens/Notice';
import { Preferences } from './screens/Preferences';
import { Videolecture } from './screens/Videolecture';
import { VirtualClassroom } from './screens/VirtualClassroom';

export type CoursesStackParamList = {
  Courses: undefined;
  Course: { id: number; courseName: string };
  Notice: { noticeId: number; courseId: number };
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

export const createCoursesGroup = <T extends CoursesStackParamList>({
  Stack,
  theme,
  t,
}: ScreenGroupType<T>) => {
  return (
    <Stack.Group>
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
            backgroundColor: theme.colors.headersBackground,
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
            backgroundColor: theme.colors.headersBackground,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
        }}
      />
    </Stack.Group>
  );
};
