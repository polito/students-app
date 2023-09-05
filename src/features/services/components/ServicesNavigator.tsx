import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { TicketStatus } from '@polito/api-client';
import { TicketFAQ } from '@polito/api-client/models/TicketFAQ';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { PersonScreen } from '../../teaching/screens/PersonScreen';
import { UnreadMessagesModal } from '../../user/screens/UnreadMessagesModal';
import { ContactsScreen } from '../screens/ContactsScreen';
import { CreateTicketScreen } from '../screens/CreateTicketScreen';
import { DegreeCourseScreen } from '../screens/DegreeCourseScreen';
import { JobOfferScreen } from '../screens/JobOfferScreen';
import { JobOffersScreen } from '../screens/JobOffersScreen';
import { NewsItemScreen } from '../screens/NewsItemScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { StaffScreen } from '../screens/StaffScreen';
import { TicketFaqScreen } from '../screens/TicketFaqScreen';
import { TicketFaqsScreen } from '../screens/TicketFaqsScreen';
import { TicketListScreen } from '../screens/TicketListScreen';
import { TicketScreen } from '../screens/TicketScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { DegreeNavigator } from './DegreeNavigator';
import { OfferingNavigator } from './OfferingNavigator';

export type OfferingStackParamList = {
  Offering: undefined;
  Degree: { id: string; year?: string };
  DegreeCourse: { courseShortcode: string; year?: string };
};

export type ServiceStackParamList = OfferingStackParamList & {
  Home: undefined;
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
  Person: { id: number };
  Staff: { personIds: number[] };
  Offering: undefined;
  Degree: { id: string };
  DegreeCourse: { courseShortcode: string };
};

const Stack = createNativeStackNavigator<ServiceStackParamList>();

export const ServicesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
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
        name="Home"
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
        options={{
          headerLargeTitle: false,
          headerTitle: t('jobOfferScreen.title'),
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
        options={{
          headerTitle: t('newsScreen.title'),
          headerLargeTitle: false,
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
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.contact'),
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Offering"
        component={OfferingNavigator}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('offeringScreen.title'),
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
        name="Degree"
        component={DegreeNavigator}
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
        options={{
          headerTitle: t('degreeCourseScreen.title'),
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen name="Staff" component={StaffScreen} />
    </Stack.Navigator>
  );
};
