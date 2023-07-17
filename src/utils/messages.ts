import { Message } from '@polito/api-client';

export const hasUnreadMessages = (messages: Message[]) =>
  messages?.some(m => !m.isRead);

export const unreadMessages = (messages: Message[]) =>
  messages?.filter(m => !m.isRead);
