import { useCallback } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { get, omit, set, update } from 'lodash';

import { usePreferencesContext } from '../contexts/PreferencesContext';
import { RootParamList } from '../types/navigation';
import { PushNotificationPayload, RemoteMessage } from '../types/notifications';

export const usePushNotificationHandlers = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { unreadNotifications, updatePreference } = usePreferencesContext();

  const incrementUnread = useCallback(
    (notificationPath: (string | number)[]) => {
      const newUnreads = unreadNotifications
        ? {
            ...unreadNotifications,
          }
        : {};
      update(
        newUnreads,
        notificationPath,
        unreadCount => (unreadCount ?? 0) + 1,
      );
      updatePreference('unreadNotifications', newUnreads);
    },
    [unreadNotifications, updatePreference],
  );

  const decrementUnread = useCallback(
    (notificationPath: (string | number)[]) => {
      let newUnreads = unreadNotifications
        ? {
            ...unreadNotifications,
          }
        : {};
      const unreadCount = get(newUnreads, notificationPath);
      if (unreadCount > 1) {
        set(newUnreads, notificationPath, unreadCount - 1);
      } else {
        newUnreads = omit(newUnreads, notificationPath);
      }
      updatePreference('unreadNotifications', newUnreads);
    },
    [unreadNotifications, updatePreference],
  );

  const navigateToUpdate = useCallback(
    (notification?: RemoteMessage) => {
      if (!notification || !notification.data?.polito_transazione) {
        return;
      }
      const payload: PushNotificationPayload = JSON.parse(
        notification.data?.payload ?? 'null',
      );
      if (!payload) {
        return;
      }
      if (payload.inc) {
        const transaction = notification.data.polito_transazione;
        navigation.navigate('TeachingTab', {
          screen: 'Course',
          params: {
            id: payload.inc,
            screen: `Course${
              transaction === 'matdid' ? 'FilesScreen' : 'NoticesScreen'
            }`,
          },
        });
      } else if (payload.idTicket) {
        navigation.navigate('ServicesTab', {
          screen: 'Ticket',
          params: {
            id: payload.idTicket,
          },
        });
      } else if (payload.idAvviso && payload.origine === 'personali') {
        navigation.navigate('TeachingTab', {
          screen: 'MessagesModal',
        });
      }
    },
    [navigation],
  );

  const updateUnreadStatus = useCallback(
    (notification?: RemoteMessage) => {
      if (!notification || !notification.data?.polito_transazione) {
        return;
      }
      const payload: PushNotificationPayload = JSON.parse(
        notification.data?.payload ?? 'null',
      );
      if (!payload) {
        return;
      }
      if (payload.inc) {
        const transaction = notification.data.polito_transazione;
        incrementUnread([
          'courses',
          payload.inc,
          transaction === 'matdid' ? 'files' : 'notices',
        ]);
      } else if (payload.idTicket) {
        incrementUnread(['tickets', payload.idTicket]);
      } else if (payload.idAvviso && payload.origine === 'personali') {
        incrementUnread(['messages', payload.idAvviso]);
      }
    },
    [incrementUnread],
  );

  return { navigateToUpdate, updateUnreadStatus, decrementUnread };
};
