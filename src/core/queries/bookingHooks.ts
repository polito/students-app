import { useTranslation } from 'react-i18next';

import { BookingsApi } from '@polito/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DateTime } from 'luxon';

import { pluckData } from '../../utils/queries';
import { setTimeoutAccessibilityInfoHelper } from '../../utils/setTimeoutAccessibilityInfo';

export const BOOKINGS_QUERY_KEY = ['bookings'];
export const BOOKINGS_TOPICS_QUERY_KEY = ['booking', 'topics'];
export const BOOKINGS_SLOTS_QUERY_KEY = ['booking', 'slots'];
export const BOOKINGS_SEATS_QUERY_KEY = ['booking', 'seats'];

const useBookingClient = (): BookingsApi => {
  return new BookingsApi();
};

export const useGetBookings = () => {
  const bookingClient = useBookingClient();

  return useQuery({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: () => bookingClient.getBookings().then(pluckData),
  });
};

export const useGetBookingTopics = () => {
  const bookingClient = useBookingClient();

  return useQuery({
    queryKey: BOOKINGS_TOPICS_QUERY_KEY,
    queryFn: () => bookingClient.getBookingTopics().then(pluckData),
  });
};

export const useGetBookingSlots = (
  bookingTopicId: string,
  weekStart: DateTime,
) => {
  const bookingClient = useBookingClient();
  const fromDate = weekStart.startOf('week');
  const toDate = weekStart.endOf('week');

  return useQuery({
    queryKey: [
      ...BOOKINGS_SLOTS_QUERY_KEY,
      bookingTopicId,
      fromDate.toISODate(),
      toDate.toISODate(),
    ],
    queryFn: () =>
      bookingClient
        .getBookingSlots({
          bookingTopicId,
          fromDate: fromDate.toJSDate(),
          toDate: toDate.toJSDate(),
        })
        .then(pluckData),
    enabled: true,
  });
};

/**
 * Get booking slots for a given booking topic id and date range
 * Used to retrieve slot from a given reservation
 *
 * @param bookingTopicId
 * @param fromDate
 * @param toDate
 */
export const useGetBookingDetailSlots = (
  bookingTopicId: string,
  fromDate: DateTime,
  toDate: DateTime,
) => {
  const bookingClient = useBookingClient();

  return useQuery({
    queryKey: [
      'booking-detail',
      bookingTopicId,
      fromDate.toISO(),
      toDate.toISO(),
    ],
    queryFn: () =>
      bookingClient
        .getBookingSlots({
          bookingTopicId,
          fromDate: fromDate.toJSDate(),
          toDate: toDate.toJSDate(),
        })
        .then(pluckData),
  });
};

export const useGetBookingSeats = (
  bookingTopicId: string,
  bookingSlotId: string,
) => {
  const bookingClient = useBookingClient();

  return useQuery({
    queryKey: [...BOOKINGS_SEATS_QUERY_KEY, bookingTopicId, bookingSlotId],
    queryFn: () =>
      bookingClient
        .getBookingSeats({ bookingTopicId, bookingSlotId })
        .then(pluckData),
  });
};

export const useUpdateBooking = () => {
  const bookingClient = useBookingClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
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
    onSuccess() {
      return queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
  });
};

export const useCreateBooking = () => {
  const bookingClient = useBookingClient();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, seatId }: { slotId: number; seatId?: number }) =>
      bookingClient.createBooking({
        createBookingRequest: {
          slotId,
          seatId,
        },
      }),
    onSuccess() {
      return client.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY });
    },
  });
};

export const useDeleteBooking = (bookingId: number) => {
  const bookingClient = useBookingClient();
  const client = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => bookingClient.deleteBookingRaw({ bookingId }),
    onSuccess() {
      setTimeoutAccessibilityInfoHelper(
        t('bookingScreen.cancelFeedback'),
        1200,
      );
      return Promise.all([
        client.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY }),
        client.invalidateQueries({ queryKey: ['agenda'] }),
      ]);
    },
  });
};
