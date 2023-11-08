import { Palettes, Theme } from '@lib/ui/types/Theme';
import { Booking, BookingSeatCell } from '@polito/api-client';

import { DateTime } from 'luxon';

import { BookingCalendarEvent } from '../features/bookings/screens/BookingSlotScreen';

const isSlotBookable = (item: BookingCalendarEvent) => {
  return item.canBeBooked && item.start > DateTime.now();
};

export const isSlotFull = (item: BookingCalendarEvent) => {
  return item.bookedPlaces === item.places;
};

export const isPastSlot = (item: BookingCalendarEvent) => {
  return item.start < DateTime.now();
};

export const canBeBookedWithSeatSelection = (slot: BookingCalendarEvent) => {
  return (
    slot.canBeBooked &&
    slot.hasSeatSelection &&
    slot.hasSeats &&
    slot.start > DateTime.now()
  );
};

export const getBookingStyle = (
  item: BookingCalendarEvent,
  palettes: Theme['palettes'],
  colors: Theme['colors'],
) => {
  const isBooked = item.isBooked;
  const isFull = isSlotFull(item);
  const canBeBooked = isSlotBookable(item);
  const notYetBookable = item.start > DateTime.now();
  const isPast = item.start < DateTime.now();

  if (isBooked && !isPast) {
    return {
      backgroundColor: palettes.tertiary['100'],
      color: palettes.tertiary['700'],
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
      color: palettes.gray['400'],
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
