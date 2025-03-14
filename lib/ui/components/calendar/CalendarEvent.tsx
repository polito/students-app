import { useCallback } from 'react';
import { DimensionValue } from 'react-native';

import { DateTime } from 'luxon';

import { useCalendarTouchableOpacityProps } from '../../hooks/calendar/useCalendarTouchableOpacityProps';
import {
  EventCellStyle,
  EventRenderer,
  ICalendarEventBase,
} from '../../types/Calendar';
import { getRelativeTopInDay } from '../../utils/calendar';
import { DefaultCalendarEventRenderer } from './DefaultCalendarEventRenderer';

interface CalendarEventProps<T extends ICalendarEventBase> {
  event: T;
  onPressEvent?: (event: T) => void;
  eventCellStyle?: EventCellStyle<T>;
  showTime: boolean;
  overlapOffset?: number;
  renderEvent?: EventRenderer<T>;
  ampm: boolean;
  hours: number[];
  startHour?: number;
  showAllDayEventCell?: boolean;
}

export const CalendarEvent = <T extends ICalendarEventBase>({
  event,
  onPressEvent,
  eventCellStyle,
  showTime,
  renderEvent,
  ampm,
  hours,
  startHour = 8,
  showAllDayEventCell = false,
}: CalendarEventProps<T>) => {
  const getEventCellPositionStyle = useCallback(
    (
      start: DateTime,
      end: DateTime,
    ): { height: DimensionValue; top: DimensionValue } => {
      const dayMinutes = hours.length * 60;
      const minutesInDay = showAllDayEventCell ? dayMinutes + 60 : dayMinutes;
      if (showAllDayEventCell && event.start.hour === 0) {
        return {
          height: '100%',
          top: '0%',
        };
      }

      const relativeHeight =
        100 * (1 / minutesInDay) * end.diff(start).as('minutes');

      const relativeTop = getRelativeTopInDay(
        start,
        showAllDayEventCell,
        hours,
        startHour,
      );
      return {
        height: `${relativeHeight}%`,
        top: `${relativeTop}%`,
      };
    },
    [hours, showAllDayEventCell, event.start.hour, startHour],
  );

  const touchableOpacityProps = useCalendarTouchableOpacityProps({
    event,
    eventCellStyle,
    onPressEvent,
    injectedStyles: [
      getEventCellPositionStyle(event.start, event.end),
      { start: `${event.left!}%`, end: `${event.width! + event.left!}%` },
      {
        position: 'absolute',
        width: `${event.width!}%`,
      },
    ],
  });

  const key = `${event.start.toISO()}_${event.title}`;

  if (renderEvent) {
    return renderEvent(event, touchableOpacityProps, key);
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
