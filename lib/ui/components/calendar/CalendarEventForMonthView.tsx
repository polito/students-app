import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { useCalendarTouchableOpacityProps } from '../../hooks/calendar/useCalendarTouchableOpacityProps';
import {
  EventCellStyle,
  EventRenderer,
  ICalendarEventBase,
} from '../../types/Calendar';
import { getEventSpanningInfo } from '../../utils/calendar';

interface CalendarEventProps<T extends ICalendarEventBase> {
  event: T;
  onPressEvent?: (event: T) => void;
  eventCellStyle?: EventCellStyle<T>;
  renderEvent?: EventRenderer<T>;
  date: DateTime;
  dayOfTheWeek: number;
  calendarWidth: number;
  isRTL: boolean;
  eventMinHeightForMonthView: number;
  showAdjacentMonths: boolean;
}

function _CalendarEventForMonthView<T extends ICalendarEventBase>({
  event,
  onPressEvent,
  eventCellStyle,
  renderEvent,
  date,
  dayOfTheWeek,
  calendarWidth,
  isRTL,
  eventMinHeightForMonthView,
  showAdjacentMonths,
}: CalendarEventProps<T>) {
  const theme = useTheme();

  const { eventWidth, eventWeekDuration } = useMemo(
    () =>
      getEventSpanningInfo(
        event,
        date,
        dayOfTheWeek,
        calendarWidth,
        showAdjacentMonths,
      ),
    [date, dayOfTheWeek, event, calendarWidth, showAdjacentMonths],
  );

  const touchableOpacityProps = useCalendarTouchableOpacityProps({
    event,
    eventCellStyle,
    onPressEvent,
    injectedStyles: [
      { backgroundColor: theme.colors.background },
      { left: 0 },
      { marginTop: theme.spacing[2] },
    ],
  });

  return (
    <TouchableOpacity
      style={{ minHeight: eventMinHeightForMonthView }}
      onPress={() => onPressEvent?.(event)}
    >
      {date.hasSame(event.start, 'day') ? (
        renderEvent ? (
          renderEvent(event, touchableOpacityProps)
        ) : (
          <View {...touchableOpacityProps}>
            <Text
              style={[
                { fontSize: theme.fontSizes.xs },
                // u['truncate'], TODO fix styling
                isRTL && { textAlign: 'right' },
              ]}
              numberOfLines={1}
            >
              {event.title}
            </Text>
          </View>
        )
      ) : null}
    </TouchableOpacity>
  );
}
