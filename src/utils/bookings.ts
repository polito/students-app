import { Palettes, Theme } from '@lib/ui/types/Theme';
import { Booking, BookingSeatCell } from '@polito/api-client';

import { DateTime } from 'luxon';

import { BookingCalendarEvent } from '../features/bookings/screens/BookingSlotScreen';

export const getBookingStyle = (
  item: BookingCalendarEvent,
  palettes: Theme['palettes'],
) => {
  const isBooked = !!item.isBooked;
  const isFull = item.bookedPlaces === item.places;
  const canBeBooked = !!item.canBeBooked;

  if (isBooked) {
    return {
      backgroundColor: palettes.green['100'],
      color: palettes.green['600'],
    };
  }
  if (item.start < DateTime.now()) {
    return {
      backgroundColor: palettes.gray['200'],
      color: palettes.gray['600'],
      opacity: 0.8,
    };
  }
  if (isFull) {
    return {
      backgroundColor: palettes.danger['100'],
      color: palettes.danger['600'],
    };
  }
  if (canBeBooked) {
    return {
      backgroundColor: palettes.primary['100'],
      color: palettes.primary['600'],
    };
  }
  return {
    backgroundColor: palettes.secondary['100'],
    color: palettes.secondary['700'],
  };
};

export const getBookingSlotStatus = (item: BookingCalendarEvent) => {
  const isBooked = !!item.isBooked;
  const isFull = item.bookedPlaces === item.places;
  const canBeBooked = !!item.canBeBooked;
  if (isBooked) {
    return 'bookingScreen.bookingStatus.booked';
  }
  if (isFull) {
    return 'bookingScreen.bookingStatus.full';
  }
  if (canBeBooked) {
    return 'bookingScreen.bookingStatus.available';
  }
  return 'bookingScreen.bookingStatus.notAvailable';
};

export const getSeatColorPaletteKey = (
  seatCell: BookingSeatCell,
): keyof Palettes => {
  return seatCell?.status === 'available'
    ? 'primary'
    : seatCell.status === 'booked'
    ? 'red'
    : 'red';
};

export const canBeCancelled = (booking?: Booking) => {
  return (
    !!booking?.cancelableUntil &&
    booking?.cancelableUntil.getTime() > Date.now()
  );
};
