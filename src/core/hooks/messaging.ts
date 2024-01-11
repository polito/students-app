import { useEffect } from 'react';

import messaging from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';

import { isEnvProduction } from '../../utils/env';
import {
  NOTIFICATIONS_QUERY_KEY,
  useUpdateDevicePreferences,
} from '../queries/studentHooks';
import { RemoteMessage } from '../types/notifications';
import { useNotifications } from './useNotifications';

export const useInitFirebaseMessaging = () => {
  const queryClient = useQueryClient();
  const { navigateToUpdate } = useNotifications();
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
          queryClient.invalidateQueries(NOTIFICATIONS_QUERY_KEY),
        );

        messaging().setBackgroundMessageHandler(async remoteMessage => {
          queryClient.invalidateQueries(NOTIFICATIONS_QUERY_KEY);
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
