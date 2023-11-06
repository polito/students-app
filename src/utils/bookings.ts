import { useEffect, useState } from 'react';

import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Palettes, Theme } from '@lib/ui/types/Theme';
import { Booking, BookingSeatCell, BookingSeats } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import { minBookableCellSize } from '../features/bookings/constant';
import { BookingCalendarEvent } from '../features/bookings/screens/BookingSlotScreen';

export const getBookingStyle = (
  item: BookingCalendarEvent,
  palettes: Theme['palettes'],
) => {
  const isBooked = !!item.isBooked;
  const isFull = item.bookedPlaces === item.places;
  const canBeBooked = !!item.canBeBooked;
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
      backgroundColor: palettes.primary['100'],
      color: palettes.primary['600'],
    };
  }
  if (isPast) {
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
  if (notYetBookable) {
    return {
      backgroundColor: palettes.secondary['100'],
      color: palettes.secondary['700'],
    };
  }
  return {
    backgroundColor: palettes.danger['100'],
    color: palettes.danger['700'],
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

export const useCalculateSeatSize = (
  seats?: BookingSeats,
  viewHeight?: number,
) => {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const { spacing } = useTheme();
  const [seatSize, setSeatSize] = useState(0);
  const [gap, setGap] = useState(0);
  const basicPadding = spacing[2];

  useEffect(() => {
    if (seats && !isEmpty(seats?.rows) && viewHeight) {
      const numberOfRows = seats?.rows?.length + 1;
      const maxSeatsPerRows = Math.max(
        ...seats.rows.map(row => row.seats.length),
      );
      const maxRowsOrSeats = Math.max(numberOfRows, maxSeatsPerRows);
      const calculatedGap = maxRowsOrSeats >= 30 ? spacing[1] : spacing[1.5];
      const totalGapHeight = calculatedGap * numberOfRows;
      const totalGapWidth = calculatedGap * maxSeatsPerRows;
      const realViewHeight =
        viewHeight - totalGapHeight - bottomTabBarHeight - basicPadding * 2;
      const realViewWidth = SCREEN_WIDTH - totalGapWidth - basicPadding * 2;
      const minHeight = realViewHeight / numberOfRows;
      const minWidth = realViewWidth / maxSeatsPerRows;
      setGap(calculatedGap);
      setSeatSize(Math.min(minHeight, minWidth, minBookableCellSize));
    }
  }, [seats, spacing, viewHeight, bottomTabBarHeight]);

  return { seatSize, gap };
};
