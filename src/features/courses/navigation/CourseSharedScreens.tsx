import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CourseAssignmentPdfCreationScreen } from '../screens/CourseAssignmentPdfCreationScreen';
import { CourseAssignmentUploadConfirmationScreen } from '../screens/CourseAssignmentUploadConfirmationScreen';
import { CourseAssignmentUploadScreen } from '../screens/CourseAssignmentUploadScreen';
import { CourseColorPickerScreen } from '../screens/CourseColorPickerScreen';
import { CourseDirectoryScreen } from '../screens/CourseDirectoryScreen';
import { CourseGuideScreen } from '../screens/CourseGuideScreen';
import { CourseHideEventScreen } from '../screens/CourseHideEventScreen';
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
  CourseColorPicker: { courseId: number; uniqueShortcode: string };
  CourseHideEvent: { courseId: number; uniqueShortcode: string };
}

const Stack = createNativeStackNavigator<CourseSharedScreensParamList>();

export const CourseSharedScreens = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen
        name="Course"
        component={CourseNavigator}
        getId={({ params }: { params: any }) => `${params.id}`}
        options={({ route: { params } }: { route: { params: any } }) => ({
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          animation: (params?.animated ?? true) ? 'default' : 'none',
        })}
      />
      <Stack.Screen
        name="Notice"
        component={NoticeScreen}
        getId={({ params }: { params: any }) =>
          `${params.courseId}${params.noticeId}`
        }
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('common.notice'),
        }}
      />
      <Stack.Screen
        name="CoursePreferences"
        component={CoursePreferencesScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
        options={{
          title: t('common.preferences'),
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
        }}
      />
      <Stack.Screen
        name="CourseIconPicker"
        component={CourseIconPickerScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
        options={{
          title: t('courseIconPickerScreen.title'),
          headerLargeTitle: false,
          headerSearchBarOptions: {},
        }}
      />
      <Stack.Screen
        name="CourseDirectory"
        component={CourseDirectoryScreen}
        getId={({ params }: { params: any }) => `${params?.directoryId}`}
        options={{
          headerBackButtonDisplayMode: 'minimal',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="CourseHideEvent"
        component={CourseHideEventScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
        options={{
          title: t('common.hiddenEvents'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="CourseGuide"
        component={CourseGuideScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitle: t('common.course'),
        }}
      />

      <Stack.Screen
        name="CourseVideolecture"
        component={CourseVideolectureScreen}
        getId={({ params }: { params: any }) =>
          `${params.courseId}${params.lectureId}`
        }
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('common.videoLecture'),
        }}
      />
      <Stack.Screen
        name="CourseVirtualClassroom"
        component={CourseVirtualClassroomScreen}
        getId={({ params }: { params: any }) =>
          `${params.courseId}${params.lectureId}`
        }
        options={{
          headerLargeTitle: false,
          headerBackTitle: t('common.course'),
          title: t('courseVirtualClassroomScreen.title'),
        }}
      />
      <Stack.Screen
        name="CourseAssignmentPdfCreation"
        component={CourseAssignmentPdfCreationScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
        options={{
          headerBackButtonDisplayMode: 'minimal',
          headerTitle: t('courseAssignmentPdfCreationScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="CourseAssignmentUpload"
        component={CourseAssignmentUploadScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
        options={{
          headerBackTitle: t('common.course'),
          headerTitle: t('courseAssignmentUploadScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="CourseAssignmentUploadConfirmation"
        component={CourseAssignmentUploadConfirmationScreen}
        getId={({ params }: { params: any }) => `${params.courseId}`}
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
        name="CourseColorPicker"
        component={CourseColorPickerScreen}
        getId={({ params }) => `${params.courseId}`}
        options={{
          title: t('courseColorPickerScreen.title'),
          headerLargeTitle: false,
        }}
      />
    </>
  );
};
