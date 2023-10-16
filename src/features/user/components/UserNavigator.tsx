import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { OfferingStackParamList } from '../../services/components/ServicesNavigator';
import { MessageScreen } from '../screens/MessageScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UnreadMessagesModal } from '../screens/UnreadMessagesModal';

export type UserStackParamList = OfferingStackParamList & {
  Profile: undefined;
  Settings: undefined;
  Messages: undefined;
  Message: {
    id: number;
  };
  MessagesModal: undefined;
  Person: { id: number };
};
const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      id="UserTabNavigator"
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerBlurEffect: 'systemUltraThinMaterial',
        ...useTitlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('profileScreen.title'),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: t('settingsScreen.title'),
        }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          headerTitle: t('messagesScreen.title'),
        }}
      />
      <Stack.Screen
        name="Message"
        component={MessageScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerTitle: t('messageScreen.title'),
          headerBackTitle: t('messageScreen.backTitle'),
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
