import * as React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { DateTime } from 'luxon';

import { useNow } from '../../hooks/calendar/useNow';
import { usePanResponder } from '../../hooks/calendar/usePanResponder';
import {
  CalendarCellStyle,
  EventCellStyle,
  EventRenderer,
  HorizontalDirection,
  ICalendarEventBase,
} from '../../types/Calendar';
import {
  getCountOfEventsAtEvent,
  getOrderOfEvent,
  getRelativeTopInDay,
  hours,
  isToday,
} from '../../utils/calendar';
import { CalendarEvent } from './CalendarEvent';
import { HourGuideCell } from './HourGuideCell';
import { HourGuideColumn } from './HourGuideColumn';

const styles = StyleSheet.create({
  nowIndicator: {
    position: 'absolute',
    zIndex: 10000,
    height: 2,
    width: '100%',
  },
});

interface CalendarBodyProps<T extends ICalendarEventBase> {
  cellHeight: number;
  containerHeight: number;
  dateRange: DateTime[];
  events: T[];
  scrollOffsetMinutes: number;
  ampm: boolean;
  showTime: boolean;
  style: ViewStyle;
  eventCellStyle?: EventCellStyle<T>;
  calendarCellStyle?: CalendarCellStyle;
  hideNowIndicator?: boolean;
  overlapOffset?: number;
  onPressCell?: (date: DateTime) => void;
  onPressEvent?: (event: T) => void;
  onSwipeHorizontal?: (d: HorizontalDirection) => void;
  renderEvent?: EventRenderer<T>;
  headerComponent?: React.ReactElement | null;
  headerComponentStyle?: ViewStyle;
  hourStyle?: TextStyle;
  hideHours?: boolean;
  isEventOrderingEnabled?: boolean;
}

export const CalendarBody = <T extends ICalendarEventBase>({
  containerHeight,
  cellHeight,
  dateRange,
  style,
  onPressCell,
  events,
  onPressEvent,
  eventCellStyle,
  calendarCellStyle,
  ampm,
  showTime,
  scrollOffsetMinutes,
  onSwipeHorizontal,
  hideNowIndicator,
  overlapOffset,
  renderEvent,
  headerComponent = null,
  headerComponentStyle = {},
  hourStyle = {},
  hideHours = false,
  isEventOrderingEnabled = true,
}: CalendarBodyProps<T>) => {
  const scrollView = React.useRef<ScrollView>(null);
  const { now } = useNow(!hideNowIndicator);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (scrollView.current && scrollOffsetMinutes && Platform.OS !== 'ios') {
      // We add delay here to work correct on React Native
      // see: https://stackoverflow.com/questions/33208477/react-native-android-scrollview-scrollto-not-working
      timeout = setTimeout(() => {
        if (scrollView && scrollView.current) {
          scrollView.current.scrollTo({
            y: (cellHeight * scrollOffsetMinutes) / 60,
            animated: false,
          });
        }
      }, 10);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [scrollView, scrollOffsetMinutes, cellHeight]);

  const panResponder = usePanResponder({
    onSwipeHorizontal,
  });

  const _onPressCell = React.useCallback(
    (date: DateTime) => {
      onPressCell && onPressCell(date);
    },
    [onPressCell],
  );

  const _renderMappedEvent = React.useCallback(
    (event: T, index: number) => {
      return (
        <CalendarEvent
          key={`${index}${event.start}${event.title}${event.end}`}
          event={event}
          onPressEvent={onPressEvent}
          eventCellStyle={eventCellStyle}
          showTime={showTime}
          eventCount={
            isEventOrderingEnabled
              ? getCountOfEventsAtEvent(event, events)
              : undefined
          }
          eventOrder={
            isEventOrderingEnabled ? getOrderOfEvent(event, events) : undefined
          }
          overlapOffset={overlapOffset}
          renderEvent={renderEvent}
          ampm={ampm}
        />
      );
    },
    [
      ampm,
      eventCellStyle,
      events,
      isEventOrderingEnabled,
      onPressEvent,
      overlapOffset,
      renderEvent,
      showTime,
    ],
  );

  return (
    <React.Fragment>
      {headerComponent != null ? (
        <View style={headerComponentStyle}>{headerComponent}</View>
      ) : null}
      <ScrollView
        style={[
          {
            height: containerHeight - cellHeight * 3,
          },
          style,
        ]}
        ref={scrollView}
        scrollEventThrottle={32}
        {...panResponder.panHandlers}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentOffset={
          Platform.OS === 'ios'
            ? { x: 0, y: scrollOffsetMinutes }
            : { x: 0, y: 0 }
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            // [
            //   u['flex-1'],
            //   theme.isRTL ? u['flex-row-reverse'] : u['flex-row'],
            // ]
          }}
        >
          {!hideHours && (
            <View style={{}}>
              {/* TODO fix style [u['z-20'], u['w-50']] */}
              {hours.map(hour => (
                <HourGuideColumn
                  key={hour}
                  cellHeight={cellHeight}
                  hour={hour}
                  ampm={ampm}
                  hourStyle={hourStyle}
                />
              ))}
            </View>
          )}

          {dateRange.map(date => (
            <View
              style={{
                flex: 1,
                overflow: 'hidden',
              }}
              key={date.toString()}
            >
              {hours.map((hour, index) => (
                <HourGuideCell
                  key={hour}
                  cellHeight={cellHeight}
                  date={date}
                  hour={hour}
                  onPress={_onPressCell}
                  index={index}
                  calendarCellStyle={calendarCellStyle}
                />
              ))}

              {events
                .filter(
                  ({ start, end }) =>
                    start.hasSame(date, 'day') && end.hour !== 23,
                )
                .map(_renderMappedEvent)}

              {isToday(date) && !hideNowIndicator && (
                <View
                  style={[
                    styles.nowIndicator,
                    { backgroundColor: 'red' }, // todo attach to palette
                    { top: `${getRelativeTopInDay(now)}%` },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </React.Fragment>
  );
};
