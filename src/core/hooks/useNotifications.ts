import { useCallback } from 'react';

import {
  CourseModulePreviousEditionsInner,
  MessageType,
} from '@polito/api-client';
import { Notification } from '@polito/api-client/models/Notification';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { get, has, setWith } from 'lodash';

import { CourseTabsParamList } from '../../features/courses/navigation/CourseNavigator';
import { useMfaChallengeHandler } from '../queries/authHooks';
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

export const CourseTransactionId = {
  avvisidoc: 'avvisidoc',
  videolezioni: 'videolezioni',
  virtualclassroom: 'virtualclassroom',
  matdid: 'matdid',
} as const;

export type CourseTransactionId =
  (typeof CourseTransactionId)[keyof typeof CourseTransactionId];

export const TransactionId = {
  ...MessageType,
  ...CourseTransactionId,
  ticket: 'ticket',
  booking: 'booking',
  avvisi: 'avvisi',
} as const;

export type TransactionId = (typeof TransactionId)[keyof typeof TransactionId];

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
      ).then(() =>
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
      );
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
      // https://github.com/polito/students-app/blob/v1.6.9/src/core/hooks/useNotifications.ts#L24
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

  const getUnreadsCountPerCourse = useCallback(
    (
      courseId?: number | null,
      prevEditions?: CourseModulePreviousEditionsInner[],
    ) => {
      if (courseId === undefined || !prevEditions) return 0;
      const courseIds = prevEditions.map(e => e.id);
      if (courseId) {
        courseIds.push(courseId);
      }
      return (
        courseIds.reduce(
          (acc, eid) =>
            acc + (getUnreadsCount(['teaching', 'courses', eid]) ?? 0),
          0,
        ) || undefined
      );
    },
    [getUnreadsCount],
  );

  const { refetch: refetchMfaChallenge } = useMfaChallengeHandler();

  const navigateToUpdate = useCallback(
    (notification?: RemoteMessage) => {
      if (!notification || !notification.data?.polito_transaction) {
        return;
      }
      const payload = JSON.parse(
        notification.data?.payload ?? 'null',
      ) as PushNotificationPayload;
      const transaction = notification.data.polito_transaction as TransactionId;
      // Course
      const mapping =
        courseTransactionsMapping[transaction as CourseTransactionId];
      if (mapping) {
        if (payload.inc) {
          navigation.navigate('TeachingTab', {
            screen: 'Course',
            params: {
              id: payload.inc,
              screen: mapping.screen,
            },
            initial: false,
          });
        }
      }
      // Tickets
      if (transaction === TransactionId.ticket && payload.idTicket) {
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
        transaction === TransactionId.avvisi &&
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

      if (transaction === TransactionId.Mfa) {
        refetchMfaChallenge().catch(console.error);
      }
    },
    [navigation, refetchMfaChallenge],
  );

  return {
    navigateToUpdate,
    clearNotificationScope,
    getUnreadsCount,
    getUnreadsCountPerCourse,
  };
};
