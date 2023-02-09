import { TicketsApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

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
