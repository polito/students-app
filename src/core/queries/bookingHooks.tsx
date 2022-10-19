import { BookingsApi } from '@polito-it/api-client';
import { useQuery } from '@tanstack/react-query';

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
