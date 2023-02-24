import { CreateTicketRequest, TicketsApi } from '@polito/api-client';
import {
  GetTicketAttachmentRequest,
  GetTicketReplyAttachmentRequest,
  ReplyToTicketRequest,
} from '@polito/api-client/apis/TicketsApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const TICKETS_QUERY_KEY = 'tickets';
export const REPLIES_QUERY_KEY = 'replies';
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

  return useQuery([TICKETS_QUERY_KEY], () =>
    // @ts-ignore
    ticketsClient.getTickets({ test: true }),
  );
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

  // return useMutation(
  //   (dto?: ReplyToTicketRequest) =>
  //     // @ts-ignore
  //     ticketsClient.replyToTicket({...dto, test: true}, { test: true }),
  //   {
  //     onSuccess() {
  //       console.debug('onSuccess')
  //       return client.invalidateQueries(prefixKey([TICKETS_QUERY_KEY]));
  //     },
  //     onError: error => {
  //       console.debug('loginError', error);
  //     },
  //   },
  // );

  return useMutation({
    mutationFn: (dto: ReplyToTicketRequest) => {
      console.debug(dto, 'dto');
      return ticketsClient.replyToTicket(dto, { test: true });
    },
    onSuccess: async data => {
      console.debug('onSuccess', data);
      return await client.invalidateQueries([TICKETS_QUERY_KEY, ticketId]);
    },
    onError: error => {
      console.debug('loginError', error);
    },
  });
};

export const useGetTicket = (ticketId?: number) => {
  const ticketsClient = useTicketsClient();

  return useQuery(
    [TICKETS_QUERY_KEY, ticketId],
    // @ts-ignore
    () => ticketsClient.getTicket({ ticketId, test: true }),
    {
      enabled: !!ticketId,
    },
  );
};

export const useMarkTicketAsClosed = (ticketId: number) => {
  const ticketsClient = useTicketsClient();
  const client = useQueryClient();

  // @ts-ignore
  return useMutation(
    () => ticketsClient.markTicketAsClosed({ ticketId }, { test: true }),
    {
      onSuccess() {
        return client.invalidateQueries([TICKETS_QUERY_KEY]);
      },
    },
  );
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
) => {
  const ticketsClient = useTicketsClient();

  return useQuery([TICKETS_QUERY_KEY], () =>
    // @ts-ignore
    ticketsClient.getTicketReplyAttachment(request),
  );
};

export const useGetTicketAttachments = (
  request: GetTicketAttachmentRequest,
) => {
  const ticketsClient = useTicketsClient();

  return useQuery([TICKETS_QUERY_KEY], () =>
    // @ts-ignore
    ticketsClient.getTicketAttachment(request),
  );
};

// export const useSearchTicketFaqs = (search: string) => {
//   const ticketsClient = useTicketsClient();
//
//
//   return useQuery(prefixKey([TICKETS_FAQS_QUERY_KEY]), () =>
//     ticketsClient.searchTicketFAQs({ search }),
//   );
// };

export const useSearchTicketFaqs = (search: string, enabled: boolean) => {
  const ticketsClient = useTicketsClient();

  return useQuery(
    [FAQS_QUERY_KEY],
    // @ts-ignore
    () => ticketsClient.searchTicketFAQs({ search, test: true }),
    {
      enabled: enabled,
      keepPreviousData: false,
      staleTime: 0,
    },
  );
};
