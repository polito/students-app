import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@lib/ui/hooks/useTheme';

import {
  CoursesStackParamList,
  createCoursesScreens,
} from '../../features/courses/screens/createCoursesScreens';
import {
  ExamsStackParamList,
  createExamsScreens,
} from '../../features/exams/screens/createExamsScreens';
import {
  TranscriptStackParamList,
  createTranscriptScreens,
} from '../../features/transcript/screens/createTranscriptScreens';
import { HeaderLogo } from '../components/HeaderLogo';
import { titlesStyles } from '../hooks/titlesStyles';
import { Teaching } from '../screens/Teaching';

export type TeachingStackParamList = {
  Teaching: undefined;
} & CoursesStackParamList &
  ExamsStackParamList &
  TranscriptStackParamList;

const Stack = createNativeStackNavigator<TeachingStackParamList>();

export const TeachingNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  const coursesScreens = createCoursesScreens(Stack);
  const examsScreens = createExamsScreens({ Stack });
  const transcriptScreens = createTranscriptScreens({ Stack });

  return (
    <Stack.Navigator
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
        name="Teaching"
        component={Teaching}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('teachingScreen.title'),
        }}
      />
      {coursesScreens}
      {examsScreens}
      {transcriptScreens}

      {/* <Stack.Screen*/}
      {/*  name="Person"*/}
      {/*  component={PersonScreen}*/}
      {/*  options={{*/}
      {/*    headerLargeTitle: false,*/}
      {/*    headerTitle: t('common.contact'),*/}
      {/*    headerBackTitleVisible: false,*/}
      {/*  }}*/}
      {/*/ >*/}
    </Stack.Navigator>
  );
};
