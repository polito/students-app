import { useEffect, useState } from 'react';

import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { BookingSeats } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { isEmpty } from 'lodash';

import { minBookableCellSize } from '../constant';

export const useCalculateSeatsDimension = (
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
      const numberOfRows = seats?.rows?.length + 1; // rows plus desk row
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
  }, [seats, spacing, viewHeight, bottomTabBarHeight, basicPadding]);

  return { seatSize, gap };
};
