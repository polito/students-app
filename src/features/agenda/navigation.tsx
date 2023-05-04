/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'react-i18next';

import { NativeStackType } from '@core/types/navigation';

import { HeaderLogo } from '@lib/ui/components/HeaderLogo';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { ExamScreen } from '../exams/screens/ExamScreen';
import { PersonScreen } from '../people/screens/PersonScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { BookingScreen } from './screens/BookingScreen';
import { DeadlineScreen } from './screens/DeadlineScreen';
import { LectureScreen } from './screens/LectureScreen';
import { DeadlineItem, LectureItem } from './types/AgendaItem';

export type AgendaStackParamList = {
  Agenda: undefined;
  Lecture: { item: LectureItem };
  Exam: { id: number };
  Deadline: { item: DeadlineItem };
  Booking: { id: number };
  Person: { id: number };
};

export const createAgendaStackGroup = (
  Stack: NativeStackType<AgendaStackParamList>,
) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Group>
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
