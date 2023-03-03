import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { TicketStatus } from '@polito/api-client';
import { TicketFAQ } from '@polito/api-client/models/TicketFAQ';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { ServicesScreen } from '../screens/ServicesScreen';
import { TicketFaqScreen } from '../screens/TicketFaqScreen';
import { TicketFaqsScreen } from '../screens/TicketFaqsScreen';
import { TicketInsertScreen } from '../screens/TicketInsertScreen';
import { TicketListScreen } from '../screens/TicketListScreen';
import { TicketScreen } from '../screens/TicketScreen';
import { TicketsScreen } from '../screens/TicketsScreen';

export type ServiceStackParamList = {
  Home: undefined;
  Tickets: undefined;
  Ticket: { id: number };
  TicketInsert: {
    topicId?: number;
    subtopicId?: number;
  };
  TicketFaqs: undefined;
  TicketFaq: { faq: TicketFAQ };
  TicketList: {
    statuses: Array<typeof TicketStatus[keyof typeof TicketStatus]>;
  };
};

const Stack = createNativeStackNavigator<ServiceStackParamList>();

export const ServiceNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      screenOptions={{
        orientation: 'portrait',
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
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="TicketList"
        component={TicketListScreen}
        options={{
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('ticketScreen.title'),
          headerBackTitle: t('ticketScreen.headerBackTitle'),
        }}
      />
      <Stack.Screen
        name="TicketInsert"
        component={TicketInsertScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('ticketInsertScreen.title'),
          headerBackTitle: t('ticketInsertScreen.headerBackTitle'),
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
          headerBackTitle: t('ticketFaqScreen.headerBackTitle'),
        }}
      />
    </Stack.Navigator>
  );
};
