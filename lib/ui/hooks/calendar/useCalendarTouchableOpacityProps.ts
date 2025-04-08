import { useCallback, useMemo } from 'react';
import { ViewStyle } from 'react-native';

import {
  CalendarTouchableOpacityProps,
  EventCellStyle,
  ICalendarEventBase,
} from '../../types/Calendar';

interface UseCalendarTouchableOpacityPropsProps<T extends ICalendarEventBase> {
  event: T;
  eventCellStyle?: EventCellStyle<T>;
  onPressEvent?: (event: T) => void;
  injectedStyles?: ViewStyle[];
}

export function useCalendarTouchableOpacityProps<T extends ICalendarEventBase>({
  event,
  eventCellStyle,
  injectedStyles = [],
  onPressEvent,
}: UseCalendarTouchableOpacityPropsProps<T>) {
  const getEventStyle = useMemo(
    () =>
      typeof eventCellStyle === 'function'
        ? eventCellStyle
        : () => eventCellStyle,
    [eventCellStyle],
  );

  const _onPress = useCallback(() => {
    onPressEvent && onPressEvent(event);
  }, [onPressEvent, event]);

  const touchableOpacityProps: CalendarTouchableOpacityProps = {
    delayPressIn: 20,
    style: [...injectedStyles, getEventStyle(event)],
    onPress: _onPress,
    disabled: !onPressEvent,
  };

  return touchableOpacityProps;
}
