import { BookingsApi } from '@polito-it/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const BOOKINGS_QUERY_KEY = 'bookings';

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

export const useDeleteBooking = (bookingId: number) => {
  const bookingClient = useBookingClient();
  const client = useQueryClient();

  return useMutation(() => bookingClient.deleteBookingRaw({ bookingId }), {
    onSuccess() {
      return client.invalidateQueries([BOOKINGS_QUERY_KEY]);
    },
  });
};
