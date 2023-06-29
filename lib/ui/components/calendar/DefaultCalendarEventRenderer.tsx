import { Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import {
  CalendarTouchableOpacityProps,
  ICalendarEventBase,
} from '../../types/Calendar';
import { formatStartEnd } from '../../utils/calendar';

interface DefaultCalendarEventRendererProps<T extends ICalendarEventBase> {
  touchableOpacityProps: CalendarTouchableOpacityProps;
  event: T;
  showTime?: boolean;
  ampm: boolean;
}

export function DefaultCalendarEventRenderer<T extends ICalendarEventBase>({
  touchableOpacityProps,
  event,
  showTime = true,
  ampm,
}: DefaultCalendarEventRendererProps<T>) {
  const theme = useTheme();
  const eventTimeStyle = {
    fontSize: theme.fontSizes.xs,
  };
  const eventTitleStyle = {
    fontSize: theme.fontSizes.sm,
  };

  return (
    <TouchableOpacity {...touchableOpacityProps}>
      <Text style={eventTitleStyle}>{event.title}</Text>
      {showTime && (
        <Text style={eventTimeStyle}>
          {formatStartEnd(event.start, event.end, ampm ? 'h:mm a' : 'HH:mm')}
        </Text>
      )}
      {event.children && event.children}
    </TouchableOpacity>
  );
}
