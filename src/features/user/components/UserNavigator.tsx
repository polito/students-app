import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { MessagesScreen } from '../screens/MessagesScreen';
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
        name="Notifications"
        component={MessagesScreen}
        options={{
          headerTitle: t('messagesScreen.title'),
        }}
      />
    </Stack.Navigator>
  );
};
