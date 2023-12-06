import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { OnboardingModal } from '../../../core/screens/OnboardingModal';
import {
  SharedScreens,
  SharedScreensParamList,
} from '../../../shared/navigation/SharedScreens';
import {
  CourseSharedScreens,
  CourseSharedScreensParamList,
} from '../../courses/navigation/CourseSharedScreens';
import { CoursesScreen } from '../../courses/screens/CoursesScreen';
import { PlacesNavigator } from '../../places/components/PlacesNavigator';
import { PlacesStackParamList } from '../../places/components/PlacesNavigator';
import { ExamQuestionScreen } from '../screens/ExamQuestionScreen';
import { ExamRequestScreen } from '../screens/ExamRequestScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { TeachingScreen } from '../screens/TeachingScreen';
import { TranscriptScreen } from '../screens/TranscriptScreen';

export type TeachingStackParamList = CourseSharedScreensParamList &
  SharedScreensParamList & {
    Home: undefined;
    Courses: undefined;
    Exams: undefined;
    Exam: { id: number };
    ExamQuestion: { id: number };
    ExamRequest: { id: number };
    MessagesModal: undefined;
    Transcript: undefined;
    OnboardingModal: undefined;
    PlacesTeachingStack: NavigatorScreenParams<PlacesStackParamList>;
  };

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
        name="PlacesTeachingStack"
        component={PlacesNavigator}
        options={{
          title: t('placeScreen.title'),
          headerShown: false,
        }}
      />
      {CourseSharedScreens(Stack as any)}
      {SharedScreens(Stack as any)}
    </Stack.Navigator>
  );
};
