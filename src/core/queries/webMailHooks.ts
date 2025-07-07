import { WebmailApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const WEBMAIL_LINK_QUERY_KEY = ['webmailLink'];

const UNREAD_MAIL_QUERY_KEY = ['unreadEmails'];

const useWebmailClient = (): WebmailApi => {
  return new WebmailApi();
};

export const GetWebmailLink = async () => {
  const webmailClient = useWebmailClient();

  return webmailClient.getWebmailLink().then(pluckData);
};

export const useGetUnreadEmails = () => {
  const webmailClient = useWebmailClient();

  return useQuery({
    queryKey: UNREAD_MAIL_QUERY_KEY,
    queryFn: () => webmailClient.getUnreadEmailslNumber().then(pluckData),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};
