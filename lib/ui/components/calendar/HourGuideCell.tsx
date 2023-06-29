import { useMemo } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { CalendarCellStyle } from '../../types/Calendar';

interface HourGuideCellProps {
  cellHeight: number;
  onPress: (d: DateTime) => void;
  date: DateTime;
  hour: number;
  index: number;
  calendarCellStyle?: CalendarCellStyle;
  showBorderRight?: boolean;
  showBorderBottom?: boolean;
}

export const HourGuideCell = ({
  cellHeight,
  onPress,
  date,
  hour,
  index,
  calendarCellStyle,
  showBorderRight = false,
  showBorderBottom = false,
}: HourGuideCellProps) => {
  const theme = useTheme();

  const getCalendarCellStyle = useMemo(
    () =>
      typeof calendarCellStyle === 'function'
        ? calendarCellStyle
        : () => calendarCellStyle,
    [calendarCellStyle],
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => onPress(date.set({ hour: hour, minute: 0 }))}
    >
      <View
        style={[
          {
            borderColor: theme.colors.divider,
            borderRightWidth: showBorderRight ? StyleSheet.hairlineWidth : 0,
            borderBottomWidth: showBorderBottom ? StyleSheet.hairlineWidth : 0,
          },
          { height: cellHeight },
          { ...getCalendarCellStyle(date, index) },
        ]}
      />
    </TouchableWithoutFeedback>
  );
};
