import { useTranslation } from 'react-i18next';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export const UserNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: t('Settings'),
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: t('Notifications archive'),
        }}
      />
    </Stack.Navigator>
  );
};
