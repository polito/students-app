import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '@lib/ui/components/HeaderLogo';
import { useTheme } from '@lib/ui/hooks/useTheme';

import {
  CoursesStackParamList,
  createCoursesGroup,
} from '@features/courses/navigation';
import {
  ExamsStackParamList,
  createExamsGroup,
} from '@features/exams/navigation';
import { PersonScreen } from '@features/people/screens/PersonScreen';
import {
  TranscriptStackParamList,
  createTranscriptGroup,
} from '@features/transcript/navigation';

import { getDefaultScreenOptions } from '@utils/navigation';

import { Teaching } from '../screens/Teaching';

export type TeachingStackParamList = {
  Teaching: undefined;
  Person: {
    id: number;
  };
} & CoursesStackParamList &
  ExamsStackParamList &
  TranscriptStackParamList;

const Stack = createNativeStackNavigator<TeachingStackParamList>();

export const TeachingNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const coursesGroup = useMemo(
    () => createCoursesGroup({ Stack, theme, t }),
    [t, theme],
  );
  const examsGroup = useMemo(
    () => createExamsGroup({ Stack, theme, t }),
    [t, theme],
  );
  const transcriptScreens = useMemo(
    () => createTranscriptGroup({ Stack, theme, t }),
    [t, theme],
  );

  return (
    <Stack.Navigator screenOptions={getDefaultScreenOptions(theme)}>
      <Stack.Screen
        name="Teaching"
        component={Teaching}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('teachingScreen.title'),
        }}
      />
      {coursesGroup}
      {examsGroup}
      {transcriptScreens}
      <Stack.Screen
        name="Person"
        component={PersonScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
