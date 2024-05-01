import { WebmailApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const WEBMAIL_QUERY_KEY = ['linkToWebmail'];

export const UNREAD_MAIL_QUERY_KEY = ['unreadEmails'];

const useWebmailClient = (): WebmailApi => {
  return new WebmailApi();
};

export const useGetWebmail = () => {
  const webmailClient = useWebmailClient();

  return useQuery(WEBMAIL_QUERY_KEY, () =>
    webmailClient.getWebmailLink().then(pluckData),
  );
};

export const useGetUnreadWebmail = () => {
  const webmailClient = useWebmailClient();

  return useQuery(UNREAD_MAIL_QUERY_KEY, () =>
    webmailClient.getUnreadEmailslNumber().then(pluckData),
  );
};
