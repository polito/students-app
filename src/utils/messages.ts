import { Message } from '@polito/student-api-client';

export const hasUnreadMessages = (messages: Message[]) =>
  messages.some(m => !m.isRead);

export const filterUnread = (messages: Message[]) =>
  messages.filter(m => !m.isRead);
