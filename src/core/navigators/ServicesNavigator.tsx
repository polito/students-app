import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { TicketStatus } from '@polito/api-client';
import { TicketFAQ } from '@polito/api-client/models/TicketFAQ';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { CreateTicketScreen } from '../../features/services/screens/CreateTicketScreen';
import { ServicesScreen } from '../../features/services/screens/ServicesScreen';
import { TicketFaqScreen } from '../../features/services/screens/TicketFaqScreen';
import { TicketFaqsScreen } from '../../features/services/screens/TicketFaqsScreen';
import { TicketListScreen } from '../../features/services/screens/TicketListScreen';
import { TicketScreen } from '../../features/services/screens/TicketScreen';
import { TicketsScreen } from '../../features/services/screens/TicketsScreen';
import { HeaderLogo } from '../components/HeaderLogo';
import { titlesStyles } from '../hooks/titlesStyles';

export type ServiceStackParamList = {
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
    statuses: Array<(typeof TicketStatus)[keyof typeof TicketStatus]>;
  };
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
        ...titlesStyles(theme),
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
    </Stack.Navigator>
  );
};
