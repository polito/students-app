import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { TemporaryDirectoryPath } from 'react-native-fs';

import {
  BASE_PATH,
  CreateTicketRequest,
  GetTicketAttachmentRequest,
  GetTicketReplyAttachmentRequest,
  ReplyToTicketRequest,
  TicketsApi,
} from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData, rethrowApiError } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const TICKETS_QUERY_KEY = ['tickets'];
export const TICKET_QUERY_PREFIX = 'ticket';

export const TICKETS_ATTACHMENTS_PREFIX = 'attachments';
export const TOPICS_QUERY_KEY = ['topics'];
export const FAQS_QUERY_KEY = ['faqs'];

const useTicketsClient = (): TicketsApi => {
  return new TicketsApi();
};

export const useGetTickets = () => {
  const ticketsClient = useTicketsClient();

  return useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: () => ticketsClient.getTickets().then(pluckData),
  });
};

export const useCreateTicket = () => {
  const client = useQueryClient();
  const ticketsClient = useTicketsClient();

  return useMutation({
    mutationFn: async (dto: CreateTicketRequest) => {
      try {
        const res = await ticketsClient.createTicket(dto);
        return pluckData(res);
      } catch (err) {
        await rethrowApiError(err as Error);
      }
    },
    onSuccess() {
      return client.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
    },
  });
};

export const useReplyToTicket = (ticketId: number) => {
  const client = useQueryClient();
  const ticketsClient = useTicketsClient();
  const invalidatesQueries = [
    TICKETS_QUERY_KEY,
    [TICKET_QUERY_PREFIX, ticketId],
  ];

  return useMutation({
    mutationFn: (dto: ReplyToTicketRequest) => {
      return ticketsClient.replyToTicket(dto);
    },
    onSuccess() {
      return invalidatesQueries.forEach(queryKey =>
        client.invalidateQueries({ queryKey }),
      );
    },
  });
};

export const useGetTicket = (ticketId: number) => {
  const ticketsClient = useTicketsClient();

  return useQuery({
    queryKey: [TICKET_QUERY_PREFIX, ticketId],
    queryFn: () => ticketsClient.getTicket({ ticketId }).then(pluckData),
  });
};

export const useMarkTicketAsClosed = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();
  const invalidatesQueries = [
    TICKETS_QUERY_KEY,
    [TICKET_QUERY_PREFIX, ticketId],
  ];

  return useMutation({
    mutationFn: () => ticketsClient.markTicketAsClosed({ ticketId }),
    onSuccess() {
      return invalidatesQueries.forEach(queryKey =>
        client.invalidateQueries({ queryKey }),
      );
    },
  });
};

export const useMarkTicketAsRead = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();
  const invalidatesQueries = [
    TICKETS_QUERY_KEY,
    [TICKET_QUERY_PREFIX, ticketId],
  ];

  return useMutation({
    mutationFn: () => ticketsClient.markTicketAsRead({ ticketId }),
    onSuccess() {
      return invalidatesQueries.forEach(queryKey =>
        client.invalidateQueries({ queryKey }),
      );
    },
  });
};

export const useGetTicketTopics = () => {
  const ticketsClient = useTicketsClient();

  return useQuery({
    queryKey: TOPICS_QUERY_KEY,
    queryFn: () => ticketsClient.getTicketTopics().then(pluckData),
  });
};

export const useGetTicketReplyAttachment = (
  { ticketId, replyId, attachmentId }: GetTicketReplyAttachmentRequest,
  fileName: string,
  enabled: boolean,
) => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: [TICKETS_ATTACHMENTS_PREFIX, ticketId, replyId, attachmentId],
    queryFn: () =>
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
    enabled,
  });
};

export const useGetTicketAttachment = (
  { ticketId, attachmentId }: GetTicketAttachmentRequest,
  fileName: string,
  enabled: boolean,
) => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: [TICKETS_ATTACHMENTS_PREFIX, ticketId, attachmentId],
    queryFn: () =>
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
    enabled,
  });
};

export const useSearchTicketFaqs = (search: string) => {
  const ticketsClient = useTicketsClient();

  return useQuery({
    queryKey: FAQS_QUERY_KEY,
    queryFn: () => ticketsClient.searchTicketFAQs({ search }).then(pluckData),
    enabled: false,
    staleTime: 0,
  });
};
