import { useCallback, useEffect } from 'react';
import {
  RESULTS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

import { MessageType } from '@polito/student-api-client';
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { useQueryClient } from '@tanstack/react-query';

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
      const messaging = getMessaging();

      onTokenRefresh(messaging, updateAppInfo);

      if ((await checkNotifications()).status !== RESULTS.GRANTED) {
        await requestNotifications();
      }

      const authorizationStatus = await requestPermission(messaging, {
        badge: true,
        alert: true,
        sound: true,
      });
      if (authorizationStatus !== AuthorizationStatus.DENIED) {
        const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
          messaging,
          remoteMessage => {
            navigateToUpdate(remoteMessage as RemoteMessage);
          },
        );

        getInitialNotification(messaging).then(remoteMessage => {
          navigateToUpdate(remoteMessage as RemoteMessage);
        });

        const unsubscribeOnMessage = onMessage(messaging, onMessageHandler);

        setBackgroundMessageHandler(messaging, onMessageHandler);

        return () =>
          [unsubscribeOnMessage, unsubscribeOnNotificationOpenedApp].forEach(
            fn => fn(),
          );
      }
    })();
  }, [navigateToUpdate, updateAppInfo, queryClient, onMessageHandler]);
};
