import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '@lib/ui/components/HeaderLogo';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { NotificationsScreen } from '@features/user/screens/NotificationsScreen';
import { ProfileScreen } from '@features/user/screens/ProfileScreen';
import { SettingsScreen } from '@features/user/screens/SettingsScreen';

import { titlesStyles } from '../hooks/titlesStyles';

export type UserStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};
const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerBlurEffect: 'systemUltraThinMaterial',
        ...titlesStyles(theme),
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
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: t('messagesScreen.title'),
        }}
      />
    </Stack.Navigator>
  );
};
