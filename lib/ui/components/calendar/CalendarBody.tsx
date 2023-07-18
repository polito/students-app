import { useCallback, useEffect, useRef } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { DateTime, Interval } from 'luxon';

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
  getMaxOverlappingEventsCount,
  getRelativeTopInDay,
  hours,
  isToday,
} from '../../utils/calendar';
import { CalendarEvent } from './CalendarEvent';
import { HourGuideCell } from './HourGuideCell';
import { HourGuideColumn } from './HourGuideColumn';

interface CalendarBodyProps<T extends ICalendarEventBase> {
  allDayEvents: T[];
  ampm: boolean;
  calendarCellStyle?: CalendarCellStyle;
  cellHeight: number;
  dateRange: DateTime[];
  eventCellStyle?: EventCellStyle<T>;
  events: T[];
  headerComponent?: React.ReactElement | null;
  headerComponentStyle?: ViewStyle;
  hideHours?: boolean;
  hideNowIndicator?: boolean;
  isEventOrderingEnabled?: boolean;
  onPressCell?: (date: DateTime) => void;
  onPressEvent?: (event: T) => void;
  onSwipeHorizontal?: (d: HorizontalDirection) => void;
  overlapOffset?: number;
  renderEvent?: EventRenderer<T>;
  scrollOffsetMinutes: number;
  showAllDayEventCell: boolean;
  showTime: boolean;
  style?: ViewStyle;
}

export const CalendarBody = <T extends ICalendarEventBase>({
  allDayEvents,
  cellHeight,
  dateRange,
  style,
  onPressCell,
  events,
  onPressEvent,
  eventCellStyle,
  calendarCellStyle,
  ampm,
  showAllDayEventCell,
  showTime,
  scrollOffsetMinutes,
  onSwipeHorizontal,
  hideNowIndicator,
  overlapOffset,
  renderEvent,
  headerComponent = null,
  headerComponentStyle = {},
  hideHours = false,
  isEventOrderingEnabled = true,
}: CalendarBodyProps<T>) => {
  const scrollView = useRef<ScrollView>(null);
  const { now } = useNow(!hideNowIndicator);

  const styles = useStylesheet(createStyles);

  useEffect(() => {
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

  const _onPressCell = useCallback(
    (date: DateTime) => {
      onPressCell && onPressCell(date);
    },
    [onPressCell],
  );

  const _renderMappedEvent = useCallback(
    (event: T, index: number, dailyEvents: T[]) => {
      const eventTime = Interval.fromDateTimes(event.start, event.end);
      const overlappingEvents = dailyEvents.filter(e =>
        eventTime.overlaps(Interval.fromDateTimes(e.start, e.end)),
      );
      const overlappingEventsCount = getMaxOverlappingEventsCount(
        event,
        overlappingEvents,
      );
      let eventIndex = overlappingEvents.indexOf(event);
      if (eventIndex === -1) eventIndex = 0;

      return (
        <CalendarEvent
          key={`${index}${event.start}${event.title}${event.end}`}
          event={event}
          onPressEvent={onPressEvent}
          eventCellStyle={eventCellStyle}
          showTime={showTime}
          eventCount={overlappingEventsCount}
          eventOrder={eventIndex}
          overlapOffset={overlapOffset}
          renderEvent={renderEvent}
          ampm={ampm}
          showAllDayEventCell={showAllDayEventCell}
        />
      );
    },
    [
      ampm,
      eventCellStyle,
      onPressEvent,
      overlapOffset,
      renderEvent,
      showAllDayEventCell,
      showTime,
    ],
  );

  return (
    <>
      {headerComponent != null ? (
        <View style={headerComponentStyle}>{headerComponent}</View>
      ) : null}
      <ScrollView
        style={style}
        ref={scrollView}
        scrollEventThrottle={32}
        {...panResponder.panHandlers}
        showsVerticalScrollIndicator={false}
        contentOffset={
          Platform.OS === 'ios'
            ? { x: 0, y: scrollOffsetMinutes }
            : { x: 0, y: 0 }
        }
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <SafeAreaView
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {!hideHours && (
            <View
              style={{
                width: 35,
              }}
            >
              {showAllDayEventCell && (
                <HourGuideColumn
                  key="all-day"
                  cellHeight={cellHeight}
                  hour="All day"
                  ampm={ampm}
                  centerVertically={false}
                />
              )}
              {hours.map(hour => (
                <HourGuideColumn
                  key={hour}
                  cellHeight={cellHeight}
                  hour={hour}
                  ampm={ampm}
                />
              ))}
            </View>
          )}

          {dateRange.map((date, i) => {
            const isLastDate = i === dateRange.length - 1;
            return (
              <View
                style={{
                  flex: 1,
                  overflow: 'hidden',
                }}
                key={date.toString()}
              >
                {showAllDayEventCell ? (
                  <View
                    style={[
                      styles.allDayEventCell,
                      { height: cellHeight },
                      isLastDate && { borderRightWidth: 0 },
                    ]}
                  >
                    {allDayEvents
                      .filter(({ end }) => end.hasSame(date, 'day'))
                      .map(_renderMappedEvent)}
                  </View>
                ) : null}
                {hours.map((hour, index) => (
                  <HourGuideCell
                    key={hour}
                    cellHeight={cellHeight}
                    date={date}
                    hour={hour}
                    onPress={_onPressCell}
                    index={index}
                    calendarCellStyle={calendarCellStyle}
                    showBorderRight={!isLastDate}
                    showBorderBottom={index < hours.length - 1}
                  />
                ))}

                {events
                  .filter(({ end }) => end.hasSame(date, 'day'))
                  .map(_renderMappedEvent)}

                {isToday(date) && !hideNowIndicator && (
                  <View
                    style={[
                      styles.nowIndicator,
                      {
                        top: `${getRelativeTopInDay(
                          now,
                          showAllDayEventCell,
                        )}%`,
                      },
                    ]}
                  >
                    <View style={styles.nowIndicatorDot} />
                  </View>
                )}
              </View>
            );
          })}
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

const createStyles = ({ dark, palettes, colors }: Theme) => {
  const indicatorColor = palettes.red[dark ? 500 : 600];
  return StyleSheet.create({
    nowIndicator: {
      position: 'absolute',
      zIndex: 10000,
      height: 2,
      width: '100%',
      backgroundColor: indicatorColor,
    },
    nowIndicatorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: -4,
      backgroundColor: indicatorColor,
    },
    allDayEventCell: {
      borderColor: colors.divider,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
    },
  });
};
