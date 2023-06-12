import { useMemo } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

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
          // TODO FIX STYLE
          // u['border-l'],
          // u['border-b'],
          { borderColor: theme.palettes.gray['200'] },
          { height: cellHeight },
          { ...getCalendarCellStyle(date, index) },
        ]}
      />
    </TouchableWithoutFeedback>
  );
};
