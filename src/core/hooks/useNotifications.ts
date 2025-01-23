import { useCallback } from 'react';

import { Notification } from '@polito/api-client/models/Notification';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { get, has, setWith } from 'lodash';

import { CourseTabsParamList } from '../../features/courses/navigation/CourseNavigator';
import {
  NOTIFICATIONS_QUERY_KEY,
  useGetNotifications,
  useMarkNotificationAsRead,
} from '../queries/studentHooks';
import { RootParamList } from '../types/navigation';
import {
  PushNotificationPayload,
  RemoteMessage,
  UnreadNotificationsByScope,
} from '../types/notifications';

type PathExtractor<T, Paths extends any[] = []> = T extends Array<Notification>
  ? never
  : T extends object
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

const useUnreadNotificationsByScope = () => {
  const { data: notifications } = useGetNotifications();
  return (notifications?.data
    ?.filter(n => !n.isRead)
    ?.reduce((byScope, notif) => {
      if (notif.scope) {
        const existingNotifications = get(byScope, notif.scope);
        setWith(
          byScope,
          notif.scope,
          // Important to avoid picking up objects with numeric keys
          (Array.isArray(existingNotifications)
            ? existingNotifications
            : []
          ).concat(notif),
          Object,
        );
      }
      return byScope;
    }, {}) ?? {}) as UnreadNotificationsByScope;
};

const extractSubtreeNotifications = (root: any) => {
  const notifications: Notification[] = [];
  const exploreNode = (node: any) => {
    if (Array.isArray(node)) {
      notifications.push(...(node as any[]));
    } else if (typeof node === 'object') {
      Object.values(node).forEach(exploreNode);
    }
  };
  exploreNode(root);
  return notifications;
};

export const useNotifications = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const unreadNotifications = useUnreadNotificationsByScope();
  const { mutateAsync: markNotificationAsRead } =
    useMarkNotificationAsRead(false);
  const queryClient = useQueryClient();

  const clearNotificationScope = useCallback(
    (notificationScope: Array<string | number>) => {
      if (!has(unreadNotifications, notificationScope!)) {
        return;
      }
      const notificationsToClear = extractSubtreeNotifications(
        get(unreadNotifications, notificationScope!),
      );

      if (!Array.isArray(notificationsToClear)) {
        return;
      }

      return Promise.all(
        notificationsToClear.map(n => markNotificationAsRead(n.id)),
      ).then(() => queryClient.invalidateQueries(NOTIFICATIONS_QUERY_KEY));
    },
    [markNotificationAsRead, queryClient, unreadNotifications],
  );

  const getUnreadsCount = useCallback(
    (
      path: Array<string | number>,
      /**
       * Only count direct children
       */
      summarize = false,
    ) => {
      // TODO PathExtractor<UnreadNotificationsByScope>
      const root = get(unreadNotifications, path!);
      const visitNode = (node: object | Notification[]): number => {
        if (Array.isArray(node)) {
          return node.length ?? 0;
        }
        if (summarize) {
          return Object.keys(node ?? {}).length ?? 0;
        }
        return Object.values(node ?? {}).reduce(
          (acc, val) => acc + visitNode(val),
          0,
        );
      };
      return visitNode(root) || undefined;
    },
    [unreadNotifications],
  );

  const navigateToUpdate = useCallback(
    (notification?: RemoteMessage) => {
      if (!notification || !notification.data?.polito_transazione) {
        return;
      }
      const payload = JSON.parse(
        notification.data?.payload ?? 'null',
      ) as PushNotificationPayload;
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

  return {
    navigateToUpdate,
    clearNotificationScope,
    getUnreadsCount,
  };
};
