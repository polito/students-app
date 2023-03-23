import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { ExamScreen } from '../../teaching/screens/ExamScreen';
import { PersonScreen } from '../../teaching/screens/PersonScreen';
import { AgendaScreen } from '../screens/AgendaScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DeadlineScreen } from '../screens/DeadlineScreen';
import { LectureScreen } from '../screens/LectureScreen';
import { DeadlineItem, LectureItem } from '../types/AgendaItem';

export type AgendaStackParamList = {
  Agenda: undefined;
  Lecture: { item: LectureItem };
  Exam: { examId: number };
  Deadline: { item: DeadlineItem };
  Booking: { bookingId: number };
  Person: { personId: number };
};

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Navigator
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
    </Stack.Navigator>
  );
};
