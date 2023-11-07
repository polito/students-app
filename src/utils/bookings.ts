import { Palettes, Theme } from '@lib/ui/types/Theme';
import { Booking, BookingSeatCell } from '@polito/api-client';

import { DateTime } from 'luxon';

import { BookingCalendarEvent } from '../features/bookings/screens/BookingSlotScreen';

export const getBookingStyle = (
  item: BookingCalendarEvent,
  palettes: Theme['palettes'],
  colors: Theme['colors'],
) => {
  const isBooked = item.isBooked;
  const isFull = item.bookedPlaces === item.places;
  const canBeBooked = item.canBeBooked;
  const notYetBookable = item.start > DateTime.now();
  const isPast = item.start < DateTime.now();

  if (isBooked) {
    return {
      backgroundColor: palettes.green['100'],
      color: palettes.green['600'],
    };
  }
  if (canBeBooked) {
    return {
      backgroundColor: palettes.navy['50'],
      color: palettes.navy['600'],
    };
  }
  if (isPast) {
    return {
      backgroundColor: colors.background,
      color: palettes.gray['600'],
      opacity: 0.7,
    };
  }
  if (isFull) {
    return {
      backgroundColor: palettes.rose['200'],
      color: palettes.rose['600'],
    };
  }
  if (notYetBookable) {
    return {
      backgroundColor: palettes.orange['100'],
      color: palettes.orange['700'],
    };
  }
  return {
    backgroundColor: palettes.rose['200'],
    color: palettes.rose['600'],
  };
};

export const getBookingSlotStatus = (item: BookingCalendarEvent) => {
  const isBooked = item.isBooked;
  const isFull = item.bookedPlaces === item.places;
  const canBeBooked = item.canBeBooked;
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
