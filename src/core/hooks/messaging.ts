import { useCallback, useEffect } from 'react';
import {
  RESULTS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import { MessageType } from '@polito/api-client';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
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
  const onMessageHandler = useCallback(
    (msg: FirebaseMessagingTypes.RemoteMessage) => {
      const transactionIsMessage = Object.values(MessageType).includes(
        (msg as RemoteMessage).data?.polito_transaction,
      );

      return queryClient.invalidateQueries({
        queryKey: transactionIsMessage
          ? MESSAGES_QUERY_KEY
          : NOTIFICATIONS_QUERY_KEY,
      });
    },
    [queryClient],
  );
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

        const unsubscribeOnMessage = messaging.onMessage(onMessageHandler);

        messaging.setBackgroundMessageHandler(onMessageHandler);

        return () =>
          [unsubscribeOnMessage, unsubscribeOnNotificationOpenedApp].forEach(
            fn => fn(),
          );
      }
    })();
  }, [navigateToUpdate, updateAppInfo, queryClient, onMessageHandler]);
};
