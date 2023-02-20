import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import {
  faBookOpen,
  faCalendarDay,
  faCircleInfo,
  faCompass,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AgendaNavigator } from '../../features/agenda/components/AgendaNavigator';
import { PlacesScreen } from '../../features/places/screens/PlacesScreen';
import { ServicesScreen } from '../../features/services/screens/ServicesScreen';
import { TeachingNavigator } from '../../features/teaching/components/TeachingNavigator';
import { UserNavigator } from '../../features/user/components/UserNavigator';
import { tabBarStyle } from '../../utils/tab-bar';
import { HeaderLogo } from './HeaderLogo';

const TabNavigator = createBottomTabNavigator();

export const RootNavigator = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  return (
    <TabNavigator.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBar,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      <TabNavigator.Screen
        name="TeachingTab"
        component={TeachingNavigator}
        options={{
          tabBarAccessibilityLabel: t('teachingScreen.title'),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={faBookOpen} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="AgendaTab"
        component={AgendaNavigator}
        options={{
          tabBarAccessibilityLabel: t('agendaScreen.title'),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={faCalendarDay} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="PlacesTab"
        component={PlacesScreen}
        options={{
          tabBarAccessibilityLabel: t('placesScreen.title'),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={faCompass} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ServicesTab"
        component={ServicesScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          tabBarAccessibilityLabel: t('common.services'),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={faCircleInfo} color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ProfileTab"
        component={UserNavigator}
        options={{
          tabBarAccessibilityLabel: t('profileScreen.title'),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={faUser} color={color} size={size} />
          ),
        }}
      />
    </TabNavigator.Navigator>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    tabBarStyle: {
      ...tabBarStyle,
      backgroundColor: colors.surface,
      borderColor: colors.background,
    },
  });
