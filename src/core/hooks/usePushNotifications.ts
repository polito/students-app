import { useCallback } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { get, has, omit, setWith, updateWith } from 'lodash';

import { CourseTabsParamList } from '../../features/courses/navigation/CourseNavigator';
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

type CourseTransactionId =
  | 'avvisidoc'
  | 'videolezioni'
  | 'virtualclassroom'
  | 'matdid';

type MessageTransactionId =
  | 'emergenze'
  | 'eventi'
  | 'esitiesami'
  | 'individuale'
  | 'messaggidoc'
  | 'segreteria';

type TransactionId =
  | MessageTransactionId
  | CourseTransactionId
  | 'ticket'
  | 'booking'
  | 'avvisi';

const messageTransactionIds: MessageTransactionId[] = [
  'emergenze',
  'eventi',
  'esitiesami',
  'individuale',
  'messaggidoc',
  'segreteria',
];

const courseTransactionsMapping: Record<
  CourseTransactionId,
  {
    section: 'notices' | 'lectures' | 'files';
    screen: keyof CourseTabsParamList;
  }
> = {
  avvisidoc: { section: 'notices', screen: 'CourseNoticesScreen' },
  videolezioni: { section: 'lectures', screen: 'CourseLecturesScreen' },
  virtualclassroom: { section: 'lectures', screen: 'CourseLecturesScreen' },
  matdid: { section: 'files', screen: 'CourseFilesScreen' },
};

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
      if (!has(unreadNotifications, notificationPath!)) {
        return;
      }

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
      const transaction = notification.data.polito_transazione as TransactionId;
      // Course
      if (courseTransactionsMapping[transaction as CourseTransactionId]) {
        if (payload.inc) {
          navigation.navigate('TeachingTab', {
            screen: 'Course',
            params: {
              id: payload.inc,
              screen:
                courseTransactionsMapping[transaction as CourseTransactionId]
                  .screen,
            },
            initial: false,
          });
        }
      }
      // Tickets
      if (transaction === 'ticket' && payload.idTicket) {
        navigation.navigate('ServicesTab', {
          screen: 'Ticket',
          params: {
            id: payload.idTicket,
          },
          initial: false,
        });
      }
      // Messages
      if (
        messageTransactionIds.includes(transaction as MessageTransactionId) ||
        (transaction === 'avvisi' && payload.origine === 'personali')
      ) {
        navigation.navigate('TeachingTab', {
          screen: 'MessagesModal',
          initial: false,
        });
      }
      // News
      if (
        transaction === 'avvisi' &&
        payload.origine !== 'personali' &&
        payload.idAvviso
      ) {
        navigation.navigate('ServicesTab', {
          screen: 'NewsItem',
          params: {
            id: payload.idAvviso,
          },
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
      const transaction = notification.data.polito_transazione as TransactionId;
      // Course
      if (courseTransactionsMapping[transaction as CourseTransactionId]) {
        if (payload.inc) {
          incrementUnread([
            'teaching',
            'courses',
            payload.inc,
            courseTransactionsMapping[transaction as CourseTransactionId]
              .section,
          ]);
        }
      }
      // Tickets
      if (transaction === 'ticket' && payload.idTicket) {
        incrementUnread(['services', 'tickets', payload.idTicket.toString()]);
      }
      // Messages
      if (
        messageTransactionIds.includes(transaction as MessageTransactionId) ||
        (transaction === 'avvisi' && payload.origine === 'personali')
      ) {
        incrementUnread(['messages']);
      }
      // News
      if (
        transaction === 'avvisi' &&
        payload.origine !== 'personali' &&
        payload.idAvviso
      ) {
        incrementUnread(['services', 'news', payload.idAvviso.toString()]);
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
