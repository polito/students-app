import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

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
        orientation: 'portrait',
        headerLargeTitle: false,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerBlurEffect: 'systemUltraThinMaterial',
        ...titlesStyles(theme),
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
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
