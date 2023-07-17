import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { HeaderCloseButton } from '../../../core/components/HeaderCloseButton';
import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { useGetMessages } from '../../../core/queries/studentHooks';
import { hasUnreadMessages } from '../../../utils/messages';
import { MessageScreen } from '../screens/MessageScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { MessagesUnreadModalScreen } from '../screens/MessagesUnreadModalScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type UserStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Messages: undefined;
  Message: {
    id: number;
  };
  MessagesUnRead: undefined;
};
const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { refetch: getMessages } = useGetMessages(false);

  useEffect(() => {
    getMessages().then(({ data }) => {
      if (hasUnreadMessages(data || [])) {
        navigation.navigate('MessagesUnRead');
      }
    });
  }, []);

  return (
    <Stack.Navigator
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
        options={{
          headerTitle: t('messageScreen.title'),
          headerBackTitle: t('messageScreen.backTitle'),
        }}
      />
      <Stack.Screen
        name="MessagesUnRead"
        component={MessagesUnreadModalScreen}
        options={{
          headerTitle: t('messagesScreen.title'),
          presentation: 'modal',
          headerLeft: () => <HeaderLogo />,
          headerRight: () => <HeaderCloseButton />,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
