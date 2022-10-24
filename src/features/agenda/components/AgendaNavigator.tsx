import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Deadline } from '@polito-it/api-client';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Logo } from '../../../core/components/Logo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { ExamScreen } from '../../teaching/screens/ExamScreen';
import { AgendaScreen } from '../screens/AgendaScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DeadlineScreen } from '../screens/DeadlineScreen';
import { LectureScreen } from '../screens/LectureScreen';

export type AgendaStackParamList = {
  Agenda: undefined;
  Lecture: { id: number };
  Exam: { id: number };
  Deadline: { deadline: Deadline };
  Booking: { id: number };
};

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        ...titlesStyles(colors),
      }}
    >
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          headerLargeTitle: false,
          headerLeft: () => <Logo />,
          headerTitle: t('Agenda'),
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Lecture"
        component={LectureScreen}
        options={{
          headerTitle: t('Lecture'),
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
    </Stack.Navigator>
  );
};
