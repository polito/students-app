import { BookingsApi } from '@polito-it/api-client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getFromToDateFromPage } from '../agenda';
import { useApiContext } from '../contexts/ApiContext';

export const BOOKINGS_QUERY_KEY = 'bookings';
export const BOOKINGS_INFINITE_QUERY_KEY = 'bookingsInfinite';

const useBookingClient = (): BookingsApi => {
  const {
    clients: { bookings: bookingClient },
  } = useApiContext();
  return bookingClient;
};

export const useGetBookings = () => {
  const bookingClient = useBookingClient();

  return useQuery([BOOKINGS_QUERY_KEY], () => bookingClient.getBookings());
};

export const useGetInfiniteBookings = () => {
  const bookingClient = useBookingClient();

  return useInfiniteQuery(
    [BOOKINGS_INFINITE_QUERY_KEY],
    ({ pageParam = 0 }) => {
      const { fromDate, toDate } = getFromToDateFromPage(pageParam);
      return bookingClient.getBookings({ fromDate, toDate });
    },
  );
};

export const useDeleteBooking = (bookingId: number) => {
  const bookingClient = useBookingClient();
  const client = useQueryClient();

  return useMutation(() => bookingClient.deleteBookingRaw({ bookingId }), {
    onSuccess() {
      return client.invalidateQueries([BOOKINGS_QUERY_KEY]);
    },
  });
};
