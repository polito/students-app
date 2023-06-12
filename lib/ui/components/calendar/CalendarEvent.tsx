import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { useCalendarTouchableOpacityProps } from '../../hooks/calendar/useCalendarTouchableOpacityProps';
import {
  EventCellStyle,
  EventRenderer,
  ICalendarEventBase,
} from '../../types/Calendar';
import {
  DAY_MINUTES,
  OVERLAP_OFFSET,
  getRelativeTopInDay,
  getStyleForOverlappingEvent,
} from '../../utils/calendar';
import { DefaultCalendarEventRenderer } from './DefaultCalendarEventRenderer';

const getEventCellPositionStyle = (start: DateTime, end: DateTime) => {
  const relativeHeight = 100 * (1 / DAY_MINUTES) * end.diff(start).minutes;
  const relativeTop = getRelativeTopInDay(start);
  return {
    height: `${relativeHeight}%`,
    top: `${relativeTop}%`,
  };
};

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
}

export const CalendarEvent = <T extends ICalendarEventBase>({
  event,
  onPressEvent,
  eventCellStyle,
  showTime,
  eventCount = 1,
  eventOrder = 0,
  overlapOffset = OVERLAP_OFFSET,
  renderEvent,
  ampm,
}: CalendarEventProps<T>) => {
  const { spacing } = useTheme();

  const touchableOpacityProps = useCalendarTouchableOpacityProps({
    event,
    eventCellStyle,
    onPressEvent,
    injectedStyles: [
      getEventCellPositionStyle(event.start, event.end),
      getStyleForOverlappingEvent(eventOrder, overlapOffset),
      {
        position: 'absolute',
        marginTop: spacing[2],
        marginHorizontal: spacing[3],
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
