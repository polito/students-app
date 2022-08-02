import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TeachingNavigator } from '../../features/teaching/components/TeachingNavigator';
import { EmptyScreen } from '../../features/teaching/screens/EmptyScreen';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Teaching"
        component={TeachingNavigator}
        options={{
          tabBarLabel: t('Teaching'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Agenda'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Places"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Places'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={EmptyScreen}
        options={{
          tabBarLabel: t('Profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
