import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import {
  faBook,
  faCalendar,
  faEllipsis,
  faLocationDot,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
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
  const styles = useStylesheet(createStyles);

  return (
    <TabNavigator.Navigator
      backBehavior="history"
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
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
            <Icon icon={faUser} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ServicesTab"
        component={PlacesScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          tabBarLabel: t('common.services'),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={faEllipsis} color={color} size={size} />
          ),
        }}
      />
    </TabNavigator.Navigator>
  );
};

const createStyles = ({ spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    tabBarStyle: {
      position: Platform.OS === 'ios' ? 'absolute' : undefined,
      height: Platform.OS === 'ios' ? 84 : 60,
    },
    tabBarItemStyle: {
      paddingVertical: Platform.OS === 'android' ? spacing[1] : undefined,
    },
    tabBarLabelStyle: {
      fontFamily: 'Montserrat',
      fontWeight: fontWeights.medium,
    },
  });
