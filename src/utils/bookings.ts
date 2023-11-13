import { Theme } from '@lib/ui/types/Theme';
import { Booking, BookingTopic } from '@polito/api-client';

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
  dark: boolean,
) => {
  const isBooked = item.isBooked;
  const isFull = isSlotFull(item);
  const canBeBooked = isSlotBookable(item);
  const notYetBookable = item.start > DateTime.now();
  const isPast = item.start < DateTime.now();

  if (isBooked && !isPast) {
    return {
      backgroundColor: palettes.tertiary[dark ? '700' : '100'],
      color: palettes.tertiary[dark ? '100' : '700'],
    };
  }
  if (canBeBooked) {
    return {
      backgroundColor: dark ? palettes.navy[500] + '99' : palettes.navy[50],
      color: palettes.navy[dark ? '50' : '600'],
    };
  }
  if (isPast) {
    return {
      backgroundColor: colors.background,
      color: palettes.gray[dark ? 500 : 400],
    };
  }
  if (isFull) {
    return {
      backgroundColor: dark ? palettes.rose[800] + 'CC' : palettes.rose['200'],
      color: palettes.rose[dark ? '200' : '600'],
    };
  }
  if (notYetBookable) {
    return {
      backgroundColor: dark
        ? palettes.darkOrange[800] + 'CC'
        : palettes.orange['100'],
      color: palettes.orange[dark ? '200' : '700'],
    };
  }
  return {
    backgroundColor: palettes.rose[dark ? '600' : '200'],
    color: palettes.rose[dark ? '200' : '600'],
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

export const canBeCancelled = (booking?: Booking) => {
  return (
    !!booking?.cancelableUntil &&
    booking?.cancelableUntil.getTime() > Date.now()
  );
};

export const getCalendarHours = (startHour = 8, endHour = 19) => {
  return Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => i + startHour,
  );
};

export const getCalendarPropsFromTopic = (
  topics?: BookingTopic[],
  topicId?: string,
) => {
  const topicIndex = topics?.findIndex(topic => topic.id === topicId);
  if (!!topicIndex && topicIndex > -1 && topics) {
    return topics[topicIndex];
  }
  const topicWithSubtopics = topics?.find(topic =>
    topic.subtopics?.find(subtopic => subtopic.id === topicId),
  );
  const topic = topicWithSubtopics?.subtopics?.find(
    subtopic => subtopic.id === topicId,
  );
  return {
    ...topic,
  };
};
