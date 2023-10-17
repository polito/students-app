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
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import messaging from '@react-native-firebase/messaging';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TimingKeyboardAnimationConfig } from '@react-navigation/bottom-tabs/src/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AgendaNavigator } from '../../features/agenda/components/AgendaNavigator';
import { PlacesNavigator } from '../../features/places/components/PlacesNavigator';
import { ServicesNavigator } from '../../features/services/components/ServicesNavigator';
import { TeachingNavigator } from '../../features/teaching/components/TeachingNavigator';
import { UserNavigator } from '../../features/user/components/UserNavigator';
import { tabBarStyle } from '../../utils/tab-bar';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import {
  useGetModalMessages,
  useGetStudent,
  useUpdateDevicePreferences,
} from '../queries/studentHooks';
import { RootParamList } from '../types/navigation';
import { RemoteMessage } from '../types/notifications';
import { HeaderLogo } from './HeaderLogo';
import { TranslucentView } from './TranslucentView';

const TabNavigator = createBottomTabNavigator<RootParamList>();

export const RootNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { data: student } = useGetStudent();
  const preferencesQuery = useUpdateDevicePreferences();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { navigateToUpdate, updateUnreadStatus, getUnreadsCount } =
    usePushNotifications();

  messaging().onTokenRefresh(fcmRegistrationToken => {
    preferencesQuery.mutate({
      updatePreferencesRequest: { fcmRegistrationToken },
    });
  });

  useEffect(() => {
    if (student?.smartCardPicture) {
      FastImage.preload([
        {
          uri: student?.smartCardPicture,
        },
      ]);
    }
  }, [student]);

  useEffect(() => {
    (async () => {
      const authorizationStatus = await messaging().requestPermission({
        badge: true,
        alert: true,
        sound: true,
      });
      if (authorizationStatus !== messaging.AuthorizationStatus.DENIED) {
        const unsubscribeOnNotificationOpenedApp =
          messaging().onNotificationOpenedApp(remoteMessage => {
            navigateToUpdate(remoteMessage as RemoteMessage);
          });

        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            navigateToUpdate(remoteMessage as RemoteMessage);
          });

        const unsubscribeOnMessage = messaging().onMessage(remoteMessage =>
          updateUnreadStatus(remoteMessage as RemoteMessage),
        );

        messaging().setBackgroundMessageHandler(async remoteMessage => {
          updateUnreadStatus(remoteMessage as RemoteMessage);
        });

        return () =>
          [unsubscribeOnMessage, unsubscribeOnNotificationOpenedApp].forEach(
            fn => fn(),
          );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: messages } = useGetModalMessages();

  const { onboardingStep } = usePreferencesContext();

  useEffect(() => {
    if (onboardingStep && onboardingStep >= 3) return;
    navigation.navigate('TeachingTab', {
      screen: 'OnboardingModal',
      params: {
        step: onboardingStep ?? 0,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!onboardingStep || onboardingStep < 4) {
      return;
    }

    if (!messages || messages.length === 0) return;
    navigation.navigate('TeachingTab', {
      screen: 'Home',
      params: {
        screen: 'MessagesModal',
      },
    });
  }, [messages, navigation]);

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
        tabBarBackground: () => <TranslucentView fallbackOpacity={1} />,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarBadgeStyle: styles.tabBarBadgeStyle,
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
          tabBarBadge: getUnreadsCount(['teaching']),
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
          tabBarBadge: getUnreadsCount(['services']),
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

const createStyles = ({
  colors,
  palettes,
  fontFamilies,
  fontWeights,
  fontSizes,
}: Theme) =>
  StyleSheet.create({
    tabBarStyle: {
      ...tabBarStyle,
      position: 'absolute',
      borderTopColor: colors.divider,
    },
    tabBarItemStyle: {
      paddingVertical: 3,
    },
    tabBarBadgeStyle: {
      backgroundColor: palettes.secondary[600],
      color: 'white',
      top: -2,
      fontFamily: fontFamilies.body,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
    },
    tabBarLabelStyle: {
      width: 'auto',
    },
  });
