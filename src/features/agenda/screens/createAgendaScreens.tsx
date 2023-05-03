/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '@core/components/HeaderLogo';
import { titlesStyles } from '@core/hooks/titlesStyles';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { ExamScreen } from '../../exams/screens/ExamScreen';
import { PersonScreen } from '../../people/screens/PersonScreen';
import { DeadlineItem, LectureItem } from '../types/AgendaItem';
import { AgendaScreen } from './AgendaScreen';
import { BookingScreen } from './BookingScreen';
import { DeadlineScreen } from './DeadlineScreen';
import { LectureScreen } from './LectureScreen';

export type AgendaStackParamList = {
  Agenda: undefined;
  Lecture: { item: LectureItem };
  Exam: { id: number };
  Deadline: { item: DeadlineItem };
  Booking: { id: number };
  Person: { id: number };
};

interface Props {
  Stack: ReturnType<typeof createNativeStackNavigator<AgendaStackParamList>>;
}

export const createAgendaScreens = ({ Stack }: Props) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Group
      screenOptions={{
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...titlesStyles(theme),
      }}
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
        name="Lecture"
        component={LectureScreen}
        options={{
          headerTitle: t('common.lecture'),
        }}
      />
      <Stack.Screen
        name="Exam"
        component={ExamScreen}
        options={{
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Deadline"
        component={DeadlineScreen}
        options={{
          headerLargeTitle: false,
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
    </Stack.Group>
  );
};
