import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { ExamScreen } from '../../teaching/screens/ExamScreen';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { AgendaScreen } from '../screens/AgendaScreen';
import { AgendaWeekScreen } from '../screens/AgendaWeekScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DeadlineScreen } from '../screens/DeadlineScreen';
import { LectureScreen } from '../screens/LectureScreen';
import { DeadlineItem, LectureItem } from '../types/AgendaItem';

export type AgendaStackParamList = {
  Agenda: undefined;
  AgendaWeek: undefined;
  Lecture: { item: LectureItem };
  Exam: { id: number };
  Deadline: { item: DeadlineItem };
  Booking: { id: number };
  Person: { id: number };
  MessagesModal: undefined;
};

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      id="AgendaTabNavigator"
      screenOptions={{
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...useTitlesStyles(theme),
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
        name="AgendaWeek"
        component={AgendaWeekScreen}
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
        getId={({ params }) => `${params.item.courseId}${params.item.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.lecture'),
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
        name="Booking"
        component={BookingScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.booking'),
        }}
      />
      <Stack.Screen
        name="Deadline"
        component={DeadlineScreen}
        getId={({ params }) => `${params.item.id}`}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.deadline'),
        }}
      />
      <Stack.Screen
        name="MessagesModal"
        component={UnreadMessagesModal}
        options={{
          headerTitle: t('messagesScreen.title'),
          headerLargeTitle: false,
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
        }}
      />
    </Stack.Navigator>
  );
};
