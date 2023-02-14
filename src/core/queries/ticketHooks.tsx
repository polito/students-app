import { CreateTicketRequest, TicketsApi } from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const TICKETS_QUERY_KEY = 'tickets';
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

export const useCreateTicket = (ticket: CreateTicketRequest) => {
  const ticketsClient = useTicketsClient();

  return useQuery(prefixKey([TICKETS_QUERY_KEY]), () =>
    ticketsClient.createTicket(ticket),
  );
};

export const useGetTicket = (ticketId: number) => {
  const ticketsClient = useTicketsClient();

  return useQuery(prefixKey([TICKETS_QUERY_KEY, ticketId]), () =>
    ticketsClient.getTicket({ ticketId }),
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

  return useQuery(prefixKey([TOPICS_QUERY_KEY]), () =>
    ticketsClient.getTicketTopics(),
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
    () => ticketsClient.searchTicketFAQs({ search, test: true }),
    {
      enabled: enabled,
      keepPreviousData: false,
      staleTime: 0,
    },
  );
};
