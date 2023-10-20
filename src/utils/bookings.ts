import { Theme } from '@lib/ui/types/Theme';

import { BookingCalendarEvent } from '../features/services/screens/NewBookingSlotSelectionScreen';

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
