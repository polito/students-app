import { useEffect } from 'react';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

import messaging from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';

import { isEnvProduction } from '../../utils/env';
import { useUpdateAppInfo } from '../queries/authHooks.ts';
import { NOTIFICATIONS_QUERY_KEY } from '../queries/studentHooks';
import { RemoteMessage } from '../types/notifications';
import { useNotifications } from './useNotifications';

const requestNotificationPermission = async () => {
  return await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
};

const isNotificationPermissionGranted = async () => {
  return (
    (await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)) === RESULTS.GRANTED
  );
};

export const useInitFirebaseMessaging = () => {
  const queryClient = useQueryClient();
  const { navigateToUpdate } = useNotifications();
  const { mutate: updateAppInfo } = useUpdateAppInfo();

  if (isEnvProduction) {
    messaging().onTokenRefresh(updateAppInfo);
  }

  useEffect(() => {
    (async () => {
      if (!isEnvProduction) return;

      if (!(await isNotificationPermissionGranted())) {
        await requestNotificationPermission();
      }

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
