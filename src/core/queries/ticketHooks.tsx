import { TicketsApi } from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { prefixKey } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const TICKETS_QUERY_KEY = 'tickets';

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

export const useGetTicket = (ticketId: number) => {
  const ticketsClient = useTicketsClient();

  return useQuery(prefixKey([TICKETS_QUERY_KEY]), () =>
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
