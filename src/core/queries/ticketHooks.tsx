import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { TemporaryDirectoryPath } from 'react-native-fs';

import { BASE_PATH, CreateTicketRequest, TicketsApi } from '@polito/api-client';
import {
  GetTicketAttachmentRequest,
  GetTicketReplyAttachmentRequest,
  ReplyToTicketRequest,
} from '@polito/api-client/apis/TicketsApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { prefixKey, prefixKeys } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const TICKETS_QUERY_KEY = 'tickets';
export const TICKET_QUERY_KEY = 'ticket';

export const TICKETS_ATTACHMENTS_KEY = 'attachments';
export const TOPICS_QUERY_KEY = 'topics';
export const FAQS_QUERY_KEY = 'faqs';

const useTicketsClient = (): TicketsApi => {
  const {
    clients: { tickets: ticketsClient },
  } = useApiContext();
  return ticketsClient;
};

export const useGetTickets = () => {
  const ticketsClient = useTicketsClient();

  return useQuery(prefixKey([TICKETS_QUERY_KEY]), () =>
    ticketsClient.getTickets(),
  );
};

export const useCreateTicket = () => {
  const client = useQueryClient();
  const ticketsClient = useTicketsClient();
  const invalidatesQuery = prefixKey([TICKETS_QUERY_KEY]);

  return useMutation(
    (dto?: CreateTicketRequest) => ticketsClient.createTicket(dto),
    {
      onSuccess() {
        return client.invalidateQueries(invalidatesQuery);
      },
    },
  );
};

export const useReplyToTicket = (ticketId: number) => {
  const client = useQueryClient();
  const ticketsClient = useTicketsClient();
  const invalidatesQueries = prefixKeys([
    [TICKETS_QUERY_KEY],
    [TICKET_QUERY_KEY, ticketId],
  ]);

  return useMutation({
    mutationFn: (dto: ReplyToTicketRequest) => {
      return ticketsClient.replyToTicket(dto);
    },
    onSuccess() {
      return invalidatesQueries.map(q => client.invalidateQueries(q));
    },
  });
};

export const useGetTicket = (ticketId: number) => {
  const ticketsClient = useTicketsClient();

  return useQuery(prefixKey([TICKET_QUERY_KEY, ticketId]), () =>
    ticketsClient.getTicket({ ticketId }),
  );
};

export const useMarkTicketAsClosed = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();
  const invalidatesQueries = prefixKeys([
    [TICKETS_QUERY_KEY],
    [TICKET_QUERY_KEY, ticketId],
  ]);

  return useMutation(() => ticketsClient.markTicketAsClosed({ ticketId }), {
    onSuccess() {
      return invalidatesQueries.map(q => client.invalidateQueries(q));
    },
  });
};

export const useMarkTicketAsRead = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();
  const invalidatesQuery = prefixKey([TICKETS_QUERY_KEY]);

  return useMutation(() => ticketsClient.markTicketAsRead({ ticketId }), {
    onSuccess() {
      return client.invalidateQueries(invalidatesQuery);
    },
  });
};

export const useGetTicketTopics = () => {
  const ticketsClient = useTicketsClient();

  return useQuery([TOPICS_QUERY_KEY], () => ticketsClient.getTicketTopics());
};

export const useGetTicketReplyAttachment = (
  { ticketId, replyId, attachmentId }: GetTicketReplyAttachmentRequest,
  fileName: string,
  enabled: boolean,
) => {
  const { token } = useApiContext();

  return useQuery(
    prefixKey([TICKETS_ATTACHMENTS_KEY, ticketId, replyId, attachmentId]),
    () =>
      ReactNativeBlobUtil.config({
        fileCache: true,
        path:
          TemporaryDirectoryPath +
          Platform.select({ android: '/', ios: '' }) +
          fileName,
      })
        .fetch(
          'GET',
          BASE_PATH +
            `/tickets/${ticketId}/replies/${replyId}/attachments/${attachmentId}`,
          {
            Authorization: `Bearer ${token}`,
          },
        )
        .then(
          res => Platform.select({ android: 'file://', ios: '' }) + res.path(),
        ),
    {
      enabled,
    },
  );
};

export const useGetTicketAttachment = (
  { ticketId, attachmentId }: GetTicketAttachmentRequest,
  fileName: string,
  enabled: boolean,
) => {
  const { token } = useApiContext();

  return useQuery(
    prefixKey([TICKETS_ATTACHMENTS_KEY, ticketId, attachmentId]),
    () =>
      ReactNativeBlobUtil.config({
        fileCache: true,
        path:
          TemporaryDirectoryPath +
          Platform.select({ android: '/', ios: '' }) +
          fileName,
      })
        .fetch(
          'GET',
          BASE_PATH + `/tickets/${ticketId}/attachments/${attachmentId}`,
          {
            Authorization: `Bearer ${token}`,
          },
        )
        .then(
          res => Platform.select({ android: 'file://', ios: '' }) + res.path(),
        ),
    {
      enabled,
    },
  );
};

export const useSearchTicketFaqs = (search: string, enabled: boolean) => {
  const ticketsClient = useTicketsClient();

  return useQuery(
    [FAQS_QUERY_KEY],
    () => ticketsClient.searchTicketFAQs({ search }),
    {
      enabled: enabled,
      keepPreviousData: false,
      staleTime: 0,
    },
  );
};
