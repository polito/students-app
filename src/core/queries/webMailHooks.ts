import { WebmailApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const WEBMAIL_LINK_QUERY_KEY = ['webmailLink'];

const UNREAD_MAIL_QUERY_KEY = ['unreadEmails'];

const useWebmailClient = (): WebmailApi => {
  return new WebmailApi();
};

export const useGetWebmailLink = () => {
  const webmailClient = useWebmailClient();

  return useQuery(
    WEBMAIL_LINK_QUERY_KEY,
    () => webmailClient.getWebmailLink().then(pluckData),
    {
      staleTime: 55 * 1000, // 55 seconds
      cacheTime: 55 * 1000, // 55 seconds
      refetchInterval: 55 * 1000, // 55 seconds
    },
  );
};

export const useGetUnreadEmails = () => {
  const webmailClient = useWebmailClient();

  return useQuery(
    UNREAD_MAIL_QUERY_KEY,
    () => webmailClient.getUnreadEmailslNumber().then(pluckData),
    {
      refetchInterval: 5 * 60 * 1000, // 5 minutes
    },
  );
};
