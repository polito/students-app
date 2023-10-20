import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { TicketStatus } from '@polito/api-client';
import { OfferingCourseStaff } from '@polito/api-client/models';
import { TicketFAQ } from '@polito/api-client/models/TicketFAQ';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { BookingScreen } from '../../agenda/screens/BookingScreen';
import { GuideScreen } from '../../guides/screens/GuideScreen';
import { GuidesScreen } from '../../guides/screens/GuidesScreen';
import { DegreeTopTabsNavigator } from '../../offering/navigation/DegreeTopTabsNavigator';
import { OfferingTopTabsNavigator } from '../../offering/navigation/OfferingTopTabsNavigator';
import { DegreeCourseGuideScreen } from '../../offering/screens/DegreeCourseGuideScreen';
import { DegreeCourseScreen } from '../../offering/screens/DegreeCourseScreen';
import { StaffScreen } from '../../offering/screens/StaffScreen';
import { PersonScreen } from '../../teaching/screens/PersonScreen';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { BookingsScreen } from '../screens/BookingsScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { CreateTicketScreen } from '../screens/CreateTicketScreen';
import { JobOfferScreen } from '../screens/JobOfferScreen';
import { JobOffersScreen } from '../screens/JobOffersScreen';
import { NewBookingSeatSelectionScreen } from '../screens/NewBookingSeatSelectionScreen';
import { NewBookingSlotSelectionScreen } from '../screens/NewBookingSlotSelectionScreen';
import { NewBookingTopicSelectionScreen } from '../screens/NewBookingTopicSelectionScreen';
import { NewsItemScreen } from '../screens/NewsItemScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { TicketFaqScreen } from '../screens/TicketFaqScreen';
import { TicketFaqsScreen } from '../screens/TicketFaqsScreen';
import { TicketListScreen } from '../screens/TicketListScreen';
import { TicketScreen } from '../screens/TicketScreen';
import { TicketsScreen } from '../screens/TicketsScreen';

export type OfferingStackParamList = {
  Offering: undefined;
  Degree: { id: string; year?: string; isCrossNavigation?: boolean };
  DegreeCourse: {
    courseShortcode: string;
    year?: string;
  };
  DegreeCourseGuide: {
    courseShortcode: string;
    year?: string;
  };
  Staff: {
    courseShortcode: string;
    year?: string;
    staff: OfferingCourseStaff[];
  };
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
    statuses: Array<typeof TicketStatus[keyof typeof TicketStatus]>;
  };
  JobOffers: undefined;
  JobOffer: {
    id: number;
  };
  News: undefined;
  NewsItem: { id: number };
  MessagesModal: undefined;
  Contacts: undefined;
  Person: { id: number; isCrossNavigation?: boolean };
  Bookings: undefined;
  Booking: { id: number };
  NewBookingTopicSelection: undefined;
  NewBookingSlotSelection: { topicId: string; topicName: string };
  NewBookingSeatSelection: {
    slotId: string;
    topicId: string;
    startHour: string;
    endHour: string;
    day: string;
  };
  Guide: { id: string };
  Guides: undefined;
};

const Stack = createNativeStackNavigator<ServiceStackParamList>();

export const ServicesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, palettes } = theme;

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
          headerBackTitle: t('ticketScreen.headerBackTitle'),
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
      <Stack.Screen
        name="Offering"
        component={OfferingTopTabsNavigator}
        options={{
          headerLeft: () => <HeaderLogo />,
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
        name="DegreeCourse"
        component={DegreeCourseScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
        options={{
          headerTitle: t('degreeCourseScreen.title'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="DegreeCourseGuide"
        component={DegreeCourseGuideScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
        options={{
          headerTitle: t('courseGuideScreen.title'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Staff"
        component={StaffScreen}
        getId={({ params: { courseShortcode, year } }) =>
          courseShortcode + (year ?? '0')
        }
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
        name="Person"
        component={PersonScreen}
        getId={({ params: { id } }) => id.toString()}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
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
          headerTitle: '',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="NewBookingTopicSelection"
        component={NewBookingTopicSelectionScreen}
        options={{
          headerTitle: t('bookingsScreen.newBooking'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="NewBookingSlotSelection"
        component={NewBookingSlotSelectionScreen}
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
        name="NewBookingSeatSelection"
        component={NewBookingSeatSelectionScreen}
        options={{
          headerLargeTitle: false,
          headerBackTitleVisible: false,
          presentation: 'modal',
          headerTitle: t('bookingSeatScreen.title'),
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
        name="Guides"
        component={GuidesScreen}
        options={{
          headerTitle: t('guidesScreen.title'),
          headerLargeTitle: false,
        }}
      />
    </Stack.Navigator>
  );
};
