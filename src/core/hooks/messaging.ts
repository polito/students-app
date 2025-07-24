import { useEffect } from 'react';
import {
  RESULTS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import { MessageType } from '@polito/api-client';
import { getApp } from '@react-native-firebase/app';
import { AuthorizationStatus } from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';

import { isEnvProduction } from '../../utils/env';
import { useUpdateAppInfo } from '../queries/authHooks.ts';
import {
  MESSAGES_QUERY_KEY,
  NOTIFICATIONS_QUERY_KEY,
} from '../queries/studentHooks';
import { RemoteMessage } from '../types/notifications';
import { useNotifications } from './useNotifications';

export const useInitFirebaseMessaging = () => {
  const queryClient = useQueryClient();
  const { navigateToUpdate } = useNotifications();
  const { mutate: updateAppInfo } = useUpdateAppInfo();

  useEffect(() => {
    (async () => {
      if (!isEnvProduction) return;

      const messaging = getApp().messaging();

      messaging.onTokenRefresh(updateAppInfo);

      if ((await checkNotifications()).status !== RESULTS.GRANTED) {
        await requestNotifications();
      }

      const authorizationStatus = await messaging.requestPermission({
        badge: true,
        alert: true,
        sound: true,
      });
      if (authorizationStatus !== AuthorizationStatus.DENIED) {
        const unsubscribeOnNotificationOpenedApp =
          messaging.onNotificationOpenedApp(remoteMessage => {
            navigateToUpdate(remoteMessage as RemoteMessage);
          });

        messaging.getInitialNotification().then(remoteMessage => {
          navigateToUpdate(remoteMessage as RemoteMessage);
        });

        const unsubscribeOnMessage = messaging.onMessage(msg => {
          const transactionIsMessage = Object.values(MessageType).includes(
            (msg as RemoteMessage).data?.polito_transaction,
          );

          return queryClient.invalidateQueries({
            queryKey: transactionIsMessage
              ? MESSAGES_QUERY_KEY
              : NOTIFICATIONS_QUERY_KEY,
          });
        });

        messaging.setBackgroundMessageHandler(async () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
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
