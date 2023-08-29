import { BookingsApi } from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const BOOKINGS_QUERY_KEY = ['bookings'];

const useBookingClient = (): BookingsApi => {
  return new BookingsApi();
};

export const useGetBookings = () => {
  const bookingClient = useBookingClient();

  return useQuery(BOOKINGS_QUERY_KEY, () =>
    bookingClient.getBookings().then(pluckData),
  );
};

export const useDeleteBooking = (bookingId: number) => {
  const bookingClient = useBookingClient();
  const client = useQueryClient();

  return useMutation(() => bookingClient.deleteBookingRaw({ bookingId }), {
    onSuccess() {
      return client.invalidateQueries(BOOKINGS_QUERY_KEY);
    },
  });
};
