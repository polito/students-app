import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { TicketStatus } from '@polito/api-client';
import { TicketFAQ } from '@polito/api-client/models/TicketFAQ';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import {
  SharedScreens,
  SharedScreensParamList,
} from '../../../shared/navigation/SharedScreens';
import { BookingScreen } from '../../agenda/screens/BookingScreen';
import { BookingSeatScreen } from '../../bookings/screens/BookingSeatScreen';
import { BookingSeatSelectionScreen } from '../../bookings/screens/BookingSeatSelectionScreen';
import { BookingSlotScreen } from '../../bookings/screens/BookingSlotScreen';
import { BookingTopicScreen } from '../../bookings/screens/BookingTopicScreen';
import { GuideScreen } from '../../guides/screens/GuideScreen';
import { GuidesScreen } from '../../guides/screens/GuidesScreen';
import { DegreeTopTabsNavigator } from '../../offering/navigation/DegreeTopTabsNavigator';
import { OfferingTopTabsNavigator } from '../../offering/navigation/OfferingTopTabsNavigator';
import { ContactsScreen } from '../../people/screens/ContactsScreen';
import {
  PlacesNavigator,
  PlacesStackParamList,
} from '../../places/components/PlacesNavigator';
import { SurveyListScreen } from '../../surveys/screens/SurveyListScreen';
import { SurveysScreen } from '../../surveys/screens/SurveysScreen';
import { CreateTicketScreen } from '../../tickets/screens/CreateTicketScreen';
import { TicketFaqScreen } from '../../tickets/screens/TicketFaqScreen';
import { TicketFaqsScreen } from '../../tickets/screens/TicketFaqsScreen';
import { TicketListScreen } from '../../tickets/screens/TicketListScreen';
import { TicketScreen } from '../../tickets/screens/TicketScreen';
import { TicketsScreen } from '../../tickets/screens/TicketsScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { JobOfferScreen } from '../screens/JobOfferScreen';
import { JobOffersScreen } from '../screens/JobOffersScreen';
import { NewsItemScreen } from '../screens/NewsItemScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';

export type OfferingStackParamList = SharedScreensParamList & {
  Offering: undefined;
  Degree: { id: string; year?: string };
};

export type ServiceStackParamList = OfferingStackParamList & {
  Services: undefined;
  Tickets: undefined;
  Ticket: { id: number };
  CreateTicket: {
    topicId?: number;
    subtopicId?: number;
  };
  TicketFaqs: undefined;
  TicketFaq: { faq: TicketFAQ };
  TicketList: {
    statuses: Array<(typeof TicketStatus)[keyof typeof TicketStatus]>;
  };
  JobOffers: undefined;
  JobOffer: {
    id: number;
  };
  News: undefined;
  NewsItem: { id: number };
  Contacts: undefined;
  Bookings: undefined;
  Booking: { id: number };
  BookingTopic: undefined;
  BookingSlot: { topicId: string; topicName: string };
  BookingSeatSelection: {
    slotId: string;
    topicId: string;
    startHour: string;
    endHour: string;
    day: string;
    hasSeatSelection: boolean | undefined;
  };
  BookingSeat: {
    bookingId: number;
    topicId: string;
    slotId: string;
    seatId: number;
  };
  Guides: undefined;
  Guide: { id: string };
  Surveys: undefined;
  SurveyList: { isCompiled: boolean };
  PlacesAgendaStack: NavigatorScreenParams<PlacesStackParamList>;
};

const Stack = createNativeStackNavigator<ServiceStackParamList>();

export const ServicesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      id="ServicesTabNavigator"
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerBlurEffect: 'systemUltraThinMaterial',
        ...useTitlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('servicesScreen.title'),
        }}
      />
      <Stack.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          headerTitle: t('ticketsScreen.title'),
        }}
      />
      <Stack.Screen
        name="TicketList"
        component={TicketListScreen}
        options={{
          headerTitle: t('ticketsScreen.title'),
        }}
      />
      <Stack.Screen
        name="Ticket"
        component={TicketScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerLargeTitle: false,
          headerTitle: t('ticketScreen.title'),
          headerBackTitle: t('ticketScreen.headerBackTitle'), // TODO wrong with direct navigation
          headerLargeStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Stack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('createTicketScreen.title'),
        }}
      />
      <Stack.Screen
        name="TicketFaqs"
        component={TicketFaqsScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('ticketFaqsScreen.title'),
        }}
      />
      <Stack.Screen
        name="TicketFaq"
        component={TicketFaqScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('ticketFaqScreen.title'),
        }}
      />
      <Stack.Screen
        name="JobOffers"
        component={JobOffersScreen}
        options={{
          headerTitle: t('jobOffersScreen.title'),
        }}
      />
      <Stack.Screen
        name="JobOffer"
        component={JobOfferScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerLargeTitle: false,
          headerTitle: t('jobOfferScreen.title'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{
          headerTitle: t('newsScreen.title'),
        }}
      />
      <Stack.Screen
        name="NewsItem"
        component={NewsItemScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerTitle: t('newsScreen.title'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Offering"
        component={OfferingTopTabsNavigator}
        options={{
          headerTitle: t('offeringScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
          headerShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        }}
      />
      <Stack.Screen
        name="Degree"
        component={DegreeTopTabsNavigator}
        getId={({ params: { id, year } }) => id + (year ?? '0')}
        options={{
          headerTitle: t('degreeScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        }}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          headerTitle: t('contactsScreen.title'),
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          headerTitle: t('bookingsScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerTitle: t('common.booking'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="BookingTopic"
        component={BookingTopicScreen}
        options={{
          headerTitle: t('bookingsScreen.newBooking'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="BookingSlot"
        component={BookingSlotScreen}
        options={({ route }) => ({
          headerTitle: route.params.topicName,
          headerLargeTitle: false,
          headerBackTitleVisible: false,
          headerTransparent: false,
          headerShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        })}
      />
      <Stack.Screen
        name="BookingSeatSelection"
        component={BookingSeatSelectionScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitleVisible: false,
          headerTitle: t('bookingSeatScreen.title'),
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
        name="Guides"
        component={GuidesScreen}
        options={{
          headerTitle: t('guidesScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Guide"
        component={GuideScreen}
        options={{
          headerTitle: t('guideScreen.title'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Surveys"
        component={SurveysScreen}
        options={{
          headerTitle: t('surveysScreen.title'),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="SurveyList"
        component={SurveyListScreen}
        options={{
          headerTitle: t('surveysScreen.compiledTitle'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
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
      {SharedScreens(Stack as any)}
    </Stack.Navigator>
  );
};
