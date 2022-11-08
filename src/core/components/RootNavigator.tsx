import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import {
  faBook,
  faCalendar,
  faCircleEllipsis,
  faLocationDot,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AgendaNavigator } from '../../features/agenda/components/AgendaNavigator';
import { PlacesScreen } from '../../features/places/screens/PlacesScreen';
import { TeachingNavigator } from '../../features/teaching/components/TeachingNavigator';
import { UserNavigator } from '../../features/user/components/UserNavigator';
import { HeaderLogo } from './HeaderLogo';
import { TranslucentView } from './TranslucentView';

const TabNavigator = createBottomTabNavigator();

export const RootNavigator = () => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();

  const tabBarStyle: any = {
    position: Platform.select({ ios: 'absolute' }),
  };
  if (Platform.OS === 'ios') {
    tabBarStyle.height = 84;
  }

  return (
    <TabNavigator.Navigator
      backBehavior="history"
      screenOptions={{
        tabBarStyle,
        tabBarBackground: Platform.select({
          ios: () => <TranslucentView />,
        }),
        headerShown: false,
      }}
    >
      <TabNavigator.Screen
        name="TeachingTab"
        component={TeachingNavigator}
        options={{
          tabBarLabel: t('teachingScreen.title'),
          tabBarIcon: ({ color, size }) => (
            // <Icon ios="book" android="auto-stories" color={color} size={size} />
            <Icon icon={faBook} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="AgendaTab"
        component={AgendaNavigator}
        options={{
          tabBarLabel: t('agendaScreen.title'),
          tabBarIcon: ({ color, size }) => (
            // <Icon
            //   ios="calendar"
            //   android="calendar-today"
            //   color={color}
            //   size={size}
            // />
            <Icon icon={faCalendar} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="PlacesTab"
        component={PlacesScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          tabBarLabel: t('placesScreen.title'),
          tabBarIcon: ({ color, size }) => (
            // <Icon ios="map" android="place" color={color} size={size} />
            <Icon icon={faLocationDot} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ProfileTab"
        component={UserNavigator}
        options={{
          tabBarLabel: t('profileScreen.title'),
          tabBarIcon: ({ color, size }) => (
            // <Icon ios="person" android="person" color={color} size={size} />
            <Icon icon={faUser} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ServicesTab"
        component={PlacesScreen}
        options={{
          headerLeft: () => <Logo />,
          tabBarLabel: t('Services'),
          tabBarIcon: ({ color, size }) => (
            // <Icon
            //   ios="ellipsis.circle"
            //   android="more-horiz"
            //   color={color}
            //   size={size}
            // />
            <Icon icon={faCircleEllipsis} color={color} size={size} />
          ),
        }}
      />
    </TabNavigator.Navigator>
  );
};
