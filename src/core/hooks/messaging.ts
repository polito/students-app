import { useEffect } from 'react';

import messaging from '@react-native-firebase/messaging';

import { isEnvProduction } from '../../utils/env';
import { useUpdateDevicePreferences } from '../queries/studentHooks';
import { RemoteMessage } from '../types/notifications';
import { usePushNotifications } from './usePushNotifications';

export const useInitFirebaseMessaging = () => {
  const { navigateToUpdate, updateUnreadStatus } = usePushNotifications();
  const preferencesQuery = useUpdateDevicePreferences();

  if (isEnvProduction) {
    messaging().onTokenRefresh(fcmRegistrationToken => {
      preferencesQuery.mutate({
        updatePreferencesRequest: { fcmRegistrationToken },
      });
    });
  }

  useEffect(() => {
    (async () => {
      if (!isEnvProduction) return;
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
};
