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
}

export const HourGuideCell = ({
  cellHeight,
  onPress,
  date,
  hour,
  index,
  calendarCellStyle,
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
            borderColor: theme.palettes.gray['400'],
            borderRightWidth: StyleSheet.hairlineWidth,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          { height: cellHeight },
          { ...getCalendarCellStyle(date, index) },
        ]}
      />
    </TouchableWithoutFeedback>
  );
};
