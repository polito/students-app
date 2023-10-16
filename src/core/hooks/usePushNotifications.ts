import { useCallback } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { get, omit, setWith, updateWith } from 'lodash';

import { usePreferencesContext } from '../contexts/PreferencesContext';
import { RootParamList } from '../types/navigation';
import {
  PushNotificationPayload,
  RemoteMessage,
  UnreadNotifications,
} from '../types/notifications';

type PathExtractor<T, Paths extends any[] = []> = T extends object
  ? {
      [K in keyof T]: PathExtractor<T[K], [...Paths, K]>;
    }[keyof T]
  : Paths;

export const usePushNotifications = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { unreadNotifications, updatePreference } = usePreferencesContext();

  const incrementUnread = useCallback(
    (notificationPath: PathExtractor<UnreadNotifications>) => {
      const newUnreads = unreadNotifications
        ? {
            ...unreadNotifications,
          }
        : {};
      updateWith(
        newUnreads,
        notificationPath!,
        unreadCount => (unreadCount ?? 0) + 1,
        Object,
      );
      updatePreference('unreadNotifications', newUnreads);
    },
    [unreadNotifications, updatePreference],
  );

  const decrementUnread = useCallback(
    (notificationPath: PathExtractor<UnreadNotifications>) => {
      let newUnreads = unreadNotifications
        ? {
            ...unreadNotifications,
          }
        : {};
      const unreadCount = get(newUnreads, notificationPath!);
      if (unreadCount > 1) {
        setWith(newUnreads, notificationPath!, unreadCount - 1, Object);
      } else {
        newUnreads = omit(newUnreads, notificationPath!);
      }
      updatePreference('unreadNotifications', newUnreads);
    },
    [unreadNotifications, updatePreference],
  );

  const resetUnread = useCallback(
    (notificationPath: PathExtractor<UnreadNotifications>) => {
      updatePreference(
        'unreadNotifications',
        omit(unreadNotifications, notificationPath!),
      );
    },
    [unreadNotifications, updatePreference],
  );

  const getUnreadsCount = useCallback(
    (path: PathExtractor<UnreadNotifications>) => {
      const node = get(unreadNotifications, path!);
      if (typeof node === 'number') {
        return node || undefined;
      }
      return Object.keys(node ?? {}).length || undefined;
    },
    [unreadNotifications],
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
          initial: false,
        });
      } else if (payload.idTicket) {
        navigation.navigate('ServicesTab', {
          screen: 'Ticket',
          params: {
            id: payload.idTicket,
          },
          initial: false,
        });
      } else if (payload.idAvviso && payload.origine === 'personali') {
        navigation.navigate('TeachingTab', {
          screen: 'MessagesModal',
          initial: false,
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
          'teaching',
          'courses',
          payload.inc,
          transaction === 'matdid' ? 'files' : 'notices',
        ]);
      } else if (payload.idTicket) {
        // @ts-expect-error TODO fix path typing
        incrementUnread(['services', 'tickets', payload.idTicket]);
      } else if (payload.idAvviso && payload.origine === 'personali') {
        // @ts-expect-error TODO fix path typing
        incrementUnread(['messages', payload.idAvviso]);
      }
    },
    [incrementUnread],
  );

  return {
    navigateToUpdate,
    updateUnreadStatus,
    decrementUnread,
    resetUnread,
    getUnreadsCount,
  };
};
