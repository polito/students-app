import { useCallback } from 'react';

import { DateTime } from 'luxon';

import { useCalendarTouchableOpacityProps } from '../../hooks/calendar/useCalendarTouchableOpacityProps';
import {
  EventCellStyle,
  EventRenderer,
  ICalendarEventBase,
} from '../../types/Calendar';
import {
  DAY_MINUTES,
  getRelativeTopInDay,
  getStyleForOverlappingEvent,
} from '../../utils/calendar';
import { DefaultCalendarEventRenderer } from './DefaultCalendarEventRenderer';

interface CalendarEventProps<T extends ICalendarEventBase> {
  event: T;
  onPressEvent?: (event: T) => void;
  eventCellStyle?: EventCellStyle<T>;
  showTime: boolean;
  eventCount?: number;
  eventOrder?: number;
  overlapOffset?: number;
  renderEvent?: EventRenderer<T>;
  ampm: boolean;
  showAllDayEventCell?: boolean;
}

export const CalendarEvent = <T extends ICalendarEventBase>({
  event,
  onPressEvent,
  eventCellStyle,
  showTime,
  eventCount = 1,
  eventOrder = 0,
  renderEvent,
  ampm,
  showAllDayEventCell = false,
}: CalendarEventProps<T>) => {
  const getEventCellPositionStyle = useCallback(
    (start: DateTime, end: DateTime) => {
      const minutesInDay = showAllDayEventCell ? DAY_MINUTES + 60 : DAY_MINUTES;
      if (showAllDayEventCell && event.start.hour === 0) {
        return {
          height: '100%',
          top: '0%',
        };
      }

      const relativeHeight =
        100 * (1 / minutesInDay) * end.diff(start).as('minutes');

      const relativeTop = getRelativeTopInDay(start, showAllDayEventCell);
      return {
        height: `${relativeHeight}%`,
        top: `${relativeTop}%`,
      };
    },
    [showAllDayEventCell],
  );

  const touchableOpacityProps = useCalendarTouchableOpacityProps({
    event,
    eventCellStyle,
    onPressEvent,
    injectedStyles: [
      getEventCellPositionStyle(event.start, event.end),
      getStyleForOverlappingEvent(eventOrder, eventCount),
      {
        position: 'absolute',
        width: `${98 / eventCount}%`,
      },
    ],
  });

  if (renderEvent) {
    return renderEvent(event, touchableOpacityProps);
  }

  return (
    <DefaultCalendarEventRenderer
      event={event}
      showTime={showTime}
      ampm={ampm}
      touchableOpacityProps={touchableOpacityProps}
    />
  );
};
