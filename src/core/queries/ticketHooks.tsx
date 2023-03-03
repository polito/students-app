import { CreateTicketRequest, TicketsApi } from '@polito/api-client';
import {
  GetTicketAttachmentRequest,
  GetTicketReplyAttachmentRequest,
  ReplyToTicketRequest,
} from '@polito/api-client/apis/TicketsApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const TICKETS_QUERY_KEY = 'tickets';
export const TICKETS_ATTACHMENTS_KEY = 'attachments';
export const TOPICS_QUERY_KEY = 'topics';
export const FAQS_QUERY_KEY = 'faqs';
/* eslint-disable */
// TODO: remove all @ts-ignore
const useTicketsClient = (): TicketsApi => {
  const {
    clients: { tickets: ticketsClient },
  } = useApiContext();
  return ticketsClient;
};

export const useGetTickets = () => {
  const ticketsClient = useTicketsClient();

  return useQuery([TICKETS_QUERY_KEY], () => ticketsClient.getTickets());
};

export const useCreateTicket = () => {
  const client = useQueryClient();
  const ticketsClient = useTicketsClient();

  return useMutation(
    (dto?: CreateTicketRequest) =>
      // @ts-ignore
      ticketsClient.createTicket({ ...dto, test: true }, { test: true }),
    {
      onSuccess() {
        return client.invalidateQueries([TICKETS_QUERY_KEY]);
      },
    },
  );
};

export const useReplyToTicket = (ticketId: number) => {
  const client = useQueryClient();
  const ticketsClient = useTicketsClient();

  return useMutation({
    mutationFn: (dto: ReplyToTicketRequest) => {
      console.debug({ dto });
      return ticketsClient.replyToTicket(dto);
    },
    onSuccess: async data => {
      console.debug('onSuccess', data);
      return await client.invalidateQueries([TICKETS_QUERY_KEY]);
    },
    onError: error => {
      console.debug('error', { error });
    },
  });
};

export const useGetTicket = (ticketId?: number) => {
  const ticketsClient = useTicketsClient();

  return useQuery(
    [TICKETS_QUERY_KEY, ticketId],
    () => ticketsClient.getTicket({ ticketId }),
    {
      enabled: !!ticketId,
    },
  );
};

export const useMarkTicketAsClosed = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();

  return useMutation(() => ticketsClient.markTicketAsClosed({ ticketId }), {
    onSuccess() {
      return client.invalidateQueries([TICKETS_QUERY_KEY]);
    },
  });
};

export const useMarkTicketAsRead = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();

  return useMutation(() => ticketsClient.markTicketAsRead({ ticketId }), {
    onSuccess() {
      return client.invalidateQueries([TICKETS_QUERY_KEY]);
    },
  });
};

export const useGetTicketTopics = () => {
  const ticketsClient = useTicketsClient();

  return useQuery([TOPICS_QUERY_KEY], () => ticketsClient.getTicketTopics());
};

export const useGetTicketReplyAttachments = (
  request: GetTicketReplyAttachmentRequest,
  enabled: boolean,
) => {
  const ticketsClient = useTicketsClient();

  return useQuery(
    [TICKETS_QUERY_KEY, TICKETS_ATTACHMENTS_KEY],
    () => ticketsClient.getTicketReplyAttachment(request),
    {
      enabled,
    },
  );
};

export const useGetTicketAttachments = (
  request: GetTicketAttachmentRequest,
  enabled: boolean,
) => {
  const ticketsClient = useTicketsClient();

  return useQuery(
    [TICKETS_QUERY_KEY],
    () => ticketsClient.getTicketAttachment(request),
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
