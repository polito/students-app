/* eslint-disable @typescript-eslint/naming-convention */
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export interface RemoteMessage extends FirebaseMessagingTypes.RemoteMessage {
  data: {
    count: string;
    message: string;
    notId: string;
    polito_id_notifica: string;
    polito_time_accod: string;
    polito_title: string;
    polito_transazione: string;
    polito_utente: string;
    priority: string;
    sound: string;
    vibrationPattern: string;
    payload?: string;
  };
  from: string;
  messageId: string;
  notification: {
    body?: string;
    title: string;
  };
}

export interface PushNotificationPayload {
  inc?: string;
  idTicket?: number;
  idAvviso?: number;
  origine?: string;
}

export interface UnreadNotifications {
  teaching?: {
    courses?: {
      [courseId: string]: {
        files?: number;
        notices?: number;
        lectures?: number;
      };
    };
  };

  services?: {
    tickets?: {
      [ticketId: string]: number;
    };
  };

  messages?: {
    [messageId: string]: number;
  };
}

export interface UnreadNotificationsNode {
  [key: string]: UnreadNotificationsNode | number;
}
