import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import {
  faBookOpen,
  faCircleInfo,
  faCompass,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TimingKeyboardAnimationConfig } from '@react-navigation/bottom-tabs/src/types';

import { AgendaNavigator } from '../../features/agenda/components/AgendaNavigator';
import { PlacesNavigator } from '../../features/places/components/PlacesNavigator';
import { ServicesNavigator } from '../../features/services/components/ServicesNavigator';
import { TeachingNavigator } from '../../features/teaching/components/TeachingNavigator';
import { UserNavigator } from '../../features/user/components/UserNavigator';
import { tabBarStyle } from '../../utils/tab-bar';
import { IS_IOS } from '../constants';
import { useGetStudent } from '../queries/studentHooks';
import { HeaderLogo } from './HeaderLogo';

const TabNavigator = createBottomTabNavigator();

export const RootNavigator = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { data: student } = useGetStudent();

  useEffect(() => {
    if (student?.smartCardPicture) {
      FastImage.preload([
        {
          uri: student?.smartCardPicture,
        },
      ]);
    }
  }, [student]);

  const tabBarIconSize = 20;

  const instantAnimation = {
    animation: 'timing',
    config: { duration: 0 },
  } as TimingKeyboardAnimationConfig;

  return (
    <TabNavigator.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          show: instantAnimation,
          hide: instantAnimation,
        },
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
      }}
    >
      <TabNavigator.Screen
        name="TeachingTab"
        component={TeachingNavigator}
        options={{
          tabBarLabel: t('teachingScreen.title'),
          tabBarIcon: ({ color }) => (
            <Icon icon={faBookOpen} color={color} size={tabBarIconSize} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="AgendaTab"
        component={AgendaNavigator}
        options={{
          tabBarLabel: t('agendaScreen.title'),
          tabBarIcon: ({ color }) => (
            <Icon icon={faCalendar} color={color} size={tabBarIconSize} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="PlacesTab"
        component={PlacesNavigator}
        options={{
          tabBarLabel: t('placesScreen.title'),
          tabBarIcon: ({ color }) => (
            <Icon icon={faCompass} color={color} size={tabBarIconSize} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ServicesTab"
        component={ServicesNavigator}
        options={{
          headerLeft: () => <HeaderLogo />,
          tabBarLabel: t('common.services'),
          tabBarIcon: ({ color }) => (
            <Icon icon={faCircleInfo} color={color} size={tabBarIconSize} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ProfileTab"
        component={UserNavigator}
        options={{
          tabBarLabel: t('profileScreen.title'),
          tabBarIcon: ({ color }) => (
            <Icon icon={faUser} color={color} size={tabBarIconSize} />
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
      backgroundColor: IS_IOS ? colors.headersBackground : colors.surface,
      borderTopColor: colors.divider,
    },
    tabBarItemStyle: {
      paddingVertical: 3,
    },
  });
