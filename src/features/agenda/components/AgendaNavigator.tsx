import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import {
  SharedScreens,
  SharedScreensParamList,
} from '../../../shared/navigation/SharedScreens';
import { BookingSeatScreen } from '../../bookings/screens/BookingSeatScreen';
import {
  CourseSharedScreens,
  CourseSharedScreensParamList,
} from '../../courses/navigation/CourseSharedScreens';
import { PlacesNavigator } from '../../places/components/PlacesNavigator';
import { PlacesStackParamList } from '../../places/components/PlacesNavigator';
import { ExamScreen } from '../../teaching/screens/ExamScreen';
import { AgendaScreen } from '../screens/AgendaScreen';
import { AgendaWeekScreen } from '../screens/AgendaWeekScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DeadlineScreen } from '../screens/DeadlineScreen';
import { LectureScreen } from '../screens/LectureScreen';
import { DeadlineItem, LectureItem } from '../types/AgendaItem';

export type AgendaStackParamList = CourseSharedScreensParamList &
  SharedScreensParamList & {
    Agenda: { date?: DateTime; animated?: boolean };
    AgendaWeek: { date?: DateTime };
    Lecture: { item: LectureItem };
    Exam: { id: number };
    Deadline: { item: DeadlineItem };
    Booking: { id: number };
    BookingSeat: {
      bookingId: number;
      topicId: string;
      slotId: string;
      seatId: number;
    };
    PlacesAgendaStack: NavigatorScreenParams<PlacesStackParamList>;
  };

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const {
    agendaScreen: { layout },
  } = usePreferencesContext();

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
      initialRouteName={layout === 'daily' ? 'Agenda' : 'AgendaWeek'}
    >
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={({ route: { params } }) => ({
          headerLargeTitle: false,
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('agendaScreen.title'),
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
          animation: params?.animated ?? true ? 'default' : 'none',
        })}
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
        name="BookingSeat"
        component={BookingSeatScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitleVisible: false,
          headerTitle: t('common.seat'),
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
        name="PlacesAgendaStack"
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
