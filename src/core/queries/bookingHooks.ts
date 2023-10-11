import { BookingsApi } from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const BOOKINGS_QUERY_KEY = ['bookings'];
export const BOOKINGS_TOPICS_QUERY_KEY = ['bookings', 'topics'];
export const BOOKINGS_SLOTS_QUERY_KEY = ['bookings', 'slots'];
export const BOOKINGS_SEATS_QUERY_KEY = ['bookings', 'seats'];

const useBookingClient = (): BookingsApi => {
  return new BookingsApi();
};

export const useGetBookings = () => {
  const bookingClient = useBookingClient();

  return useQuery(BOOKINGS_QUERY_KEY, () =>
    bookingClient.getBookings().then(pluckData),
  );
};

export const useGetBookingTopics = () => {
  const bookingClient = useBookingClient();

  return useQuery(BOOKINGS_TOPICS_QUERY_KEY, () =>
    bookingClient.getBookingTopics().then(pluckData),
  );
};

export const useGetBookingSlots = (bookingTopicId: string) => {
  const bookingClient = useBookingClient();

  return useQuery(BOOKINGS_SLOTS_QUERY_KEY, () =>
    bookingClient
      .getBookingSlots({
        bookingTopicId,
        // fromDate: DateTime.fromObject({
        //   day: 1,
        //   month: 11,
        //   year: 2023,
        // }).toJSDate(),
        // toDate: DateTime.fromObject({
        //   day: 3,
        //   month: 11,
        //   year: 2023,
        // }).toJSDate(),
      })
      .then(pluckData),
  );
};

export const useGetBookingSeats = (
  bookingTopicId: string,
  bookingSlotId: string,
) => {
  const bookingClient = useBookingClient();

  return useQuery(BOOKINGS_SEATS_QUERY_KEY, () =>
    bookingClient
      .getBookingSeats({ bookingTopicId, bookingSlotId })
      .then(pluckData),
  );
};

export const useUpdateBooking = () => {
  const bookingClient = useBookingClient();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      bookingId,
      isLocationChecked,
    }: {
      bookingId: number;
      isLocationChecked: boolean;
    }) =>
      bookingClient.updateBooking({
        bookingId,
        updateBookingRequest: { isLocationChecked },
      }),
    {
      onSuccess() {
        return queryClient.invalidateQueries(BOOKINGS_QUERY_KEY);
      },
    },
  );
};

export const useCreateBooking = () => {
  const bookingClient = useBookingClient();
  const client = useQueryClient();

  return useMutation(
    ({ slotId, seatId }: { slotId: number; seatId?: number }) =>
      bookingClient.createBooking({
        createBookingRequest: {
          slotId,
          seatId,
        },
      }),
    {
      onSuccess() {
        return client.invalidateQueries(BOOKINGS_QUERY_KEY);
      },
    },
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
