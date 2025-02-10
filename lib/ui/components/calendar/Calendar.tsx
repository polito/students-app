import { useCallback, useEffect, useMemo, useState } from 'react';
import { ViewStyle } from 'react-native';

import { DateTime } from 'luxon';

import {
  CalendarCellStyle,
  CalendarCellTextStyle,
  DateRangeHandler,
  EventCellStyle,
  EventRenderer,
  HeaderRenderer,
  HorizontalDirection,
  ICalendarEventBase,
  Mode,
  WeekNum,
} from '../../types/Calendar';
import {
  getDatesInMonth,
  getDatesInNextCustomDays,
  getDatesInNextOneDay,
  getDatesInNextThreeDays,
  getDatesInWeek,
  isAllDayEvent,
  modeToDaysCount,
} from '../../utils/calendar';
import { CalendarBody } from './CalendarBody';
import { CalendarHeader } from './CalendarHeader';

export interface CalendarContainerProps<T extends ICalendarEventBase> {
  /**
   * Events to be rendered. This is a required prop.
   */
  events: T[];

  /**
   * The height of calendar component. This is a required prop.
   */
  height: number;

  /**
   * Adjusts the indentation of events that occur during the same time period. Defaults to 20 on web and 8 on mobile.
   */
  overlapOffset?: number;

  /**
   * Custom style. It accepts styles or an array of styles, or a function that returns styles or an array of styles.
   */
  eventCellStyle?: EventCellStyle<T>;
  calendarCellStyle?: CalendarCellStyle;
  calendarCellTextStyle?: CalendarCellTextStyle;
  calendarContainerStyle?: ViewStyle;
  headerContainerStyle?: ViewStyle;
  headerContentStyle?: ViewStyle;
  dayHeaderStyle?: ViewStyle;
  dayHeaderHighlightColor?: string;
  weekDayHeaderHighlightColor?: string;
  bodyContainerStyle?: ViewStyle;

  cellMaxHeight?: number;

  // Custom renderer
  renderEvent?: EventRenderer<T>;
  renderHeader?: HeaderRenderer;
  // renderHeaderForMonthView?: MonthHeaderRenderer;

  ampm?: boolean;
  date?: DateTime;
  locale?: string;
  hideNowIndicator?: boolean;
  showAdjacentMonths?: boolean;
  mode?: Mode;
  scrollOffsetMinutes?: number;
  showTime?: boolean;
  swipeEnabled?: boolean;
  weekStartsOn?: WeekNum;
  onChangeDate?: DateRangeHandler;
  onPressCell?: (date: DateTime) => void;
  onPressDateHeader?: (date: DateTime) => void;
  onPressEvent?: (event: T) => void;
  weekEndsOn?: WeekNum;
  maxVisibleEventCount?: number;
  eventMinHeightForMonthView?: number;
  activeDate?: DateTime;
  headerComponent?: React.ReactElement | null;
  headerComponentStyle?: ViewStyle;
  showAllDayEventCell?: boolean;
  sortedMonthView?: boolean;
  moreLabel?: string;
  isEventOrderingEnabled?: boolean;
  hours: number[];
  startHour?: number;
}

export const Calendar = <T extends ICalendarEventBase>({
  events,
  height,
  cellMaxHeight = 50,
  ampm = false,
  date,
  eventCellStyle,
  calendarCellStyle,
  hideNowIndicator = false,
  mode = 'week',
  overlapOffset,
  scrollOffsetMinutes = 0,
  showTime = true,
  headerContainerStyle = {},
  headerContentStyle = {},
  dayHeaderStyle = {},
  dayHeaderHighlightColor = '',
  weekDayHeaderHighlightColor = '',
  // bodyContainerStyle = {},
  swipeEnabled = true,
  weekStartsOn = 0,
  onChangeDate,
  onPressCell,
  onPressDateHeader,
  onPressEvent,
  renderEvent,
  renderHeader: HeaderComponent = CalendarHeader,
  // renderHeaderForMonthView : HeaderComponentForMonthView =  CalendarHeaderForMonthView,
  weekEndsOn = 6,
  activeDate,
  headerComponent = null,
  headerComponentStyle = {},
  showAllDayEventCell = true,
  // moreLabel = '{moreCount} More',
  // showAdjacentMonths = true,
  // sortedMonthView = true,
  isEventOrderingEnabled,
  hours,
  startHour = 6,
}: CalendarContainerProps<T>) => {
  const [targetDate, setTargetDate] = useState(date);

  useEffect(() => {
    if (date) {
      setTargetDate(date);
    }
  }, [date]);

  const allDayEvents = useMemo(
    () => events.filter(event => isAllDayEvent(event.start, event.end)),
    [events],
  );

  const daytimeEvents = useMemo(
    () => events.filter(event => !isAllDayEvent(event.start, event.end)),
    [events],
  );

  const getDateRange = useCallback(
    (startDate: DateTime) => {
      switch (mode) {
        case 'month':
          return getDatesInMonth(startDate);
        case 'week':
          return getDatesInWeek(startDate, weekStartsOn);
        case '3days':
          return getDatesInNextThreeDays(startDate);
        case 'day':
          return getDatesInNextOneDay(startDate);
        case 'custom':
          return getDatesInNextCustomDays(startDate, weekStartsOn, weekEndsOn);
        default:
          throw new Error(
            `[react-native-big-calendar] The mode which you specified "${mode}" is not supported.`,
          );
      }
    },
    [mode, weekEndsOn, weekStartsOn],
  );

  const cellHeight = useMemo(() => {
    return Math.max(cellMaxHeight, height / hours?.length);
  }, [height, cellMaxHeight, hours]);

  const onSwipeHorizontal = useCallback(
    (direction: HorizontalDirection) => {
      if (!swipeEnabled) {
        return;
      }
      let nextTargetDate: DateTime;
      if (direction === 'LEFT') {
        // TODO CHECK IF targetDate can be null
        nextTargetDate = targetDate!.plus({
          day: modeToDaysCount(mode, targetDate!),
        });
      } else {
        if (mode === 'month') {
          nextTargetDate = targetDate!.minus({
            month: 1,
          });
        } else {
          nextTargetDate = targetDate!.minus({
            day: modeToDaysCount(mode, targetDate!),
          });
        }
      }
      setTargetDate(nextTargetDate);
      if (onChangeDate) {
        const nextDateRange = getDateRange(nextTargetDate);
        onChangeDate([nextDateRange[0], nextDateRange.slice(-1)[0]]);
      }
    },
    [swipeEnabled, targetDate, mode, getDateRange, onChangeDate],
  );

  const commonProps = {
    cellHeight,
    dateRange: getDateRange(targetDate!),
    mode,
    onPressEvent,
  };

  // TODO restore month view
  // if (mode === 'month') {
  //   const headerProps = {
  //     style: headerContainerStyle,
  //     locale: locale,
  //     weekStartsOn: weekStartsOn,
  //     headerContentStyle: headerContentStyle,
  //     dayHeaderStyle: dayHeaderStyle,
  //     dayHeaderHighlightColor: dayHeaderHighlightColor,
  //     weekDayHeaderHighlightColor: weekDayHeaderHighlightColor,
  //     showAllDayEventCell: showAllDayEventCell,
  //   };
  //   return (
  //     <Fragment>
  //       {/*<HeaderComponentForMonthView {...headerProps} />*/}
  //       <CalendarBodyForMonthView<T>
  //         {...commonProps}
  //         style={bodyContainerStyle}
  //         containerHeight={height}
  //         events={[...daytimeEvents, ...allDayEvents]}
  //         eventCellStyle={eventCellStyle}
  //         calendarCellStyle={calendarCellStyle}
  //         calendarCellTextStyle={calendarCellTextStyle}
  //         weekStartsOn={weekStartsOn}
  //         hideNowIndicator={hideNowIndicator}
  //         showAdjacentMonths={showAdjacentMonths}
  //         onPressCell={onPressCell}
  //         onPressDateHeader={onPressDateHeader}
  //         onPressEvent={onPressEvent}
  //         onSwipeHorizontal={onSwipeHorizontal}
  //         renderEvent={renderEvent}
  //         targetDate={targetDate}
  //         maxVisibleEventCount={maxVisibleEventCount}
  //         eventMinHeightForMonthView={eventMinHeightForMonthView}
  //         sortedMonthView={sortedMonthView}
  //         moreLabel={moreLabel}
  //       />
  //     </Fragment>
  //   );
  // }

  const headerProps = {
    ...commonProps,
    style: headerContainerStyle,
    onPressDateHeader: onPressDateHeader,
    activeDate,
    headerContentStyle: headerContentStyle,
    dayHeaderStyle: dayHeaderStyle,
    dayHeaderHighlightColor: dayHeaderHighlightColor,
    weekDayHeaderHighlightColor: weekDayHeaderHighlightColor,
  };

  return (
    <>
      <HeaderComponent {...headerProps} />
      <CalendarBody<T>
        {...commonProps}
        allDayEvents={allDayEvents}
        showAllDayEventCell={showAllDayEventCell}
        events={daytimeEvents}
        eventCellStyle={eventCellStyle}
        calendarCellStyle={calendarCellStyle}
        hideNowIndicator={hideNowIndicator}
        overlapOffset={overlapOffset}
        scrollOffsetMinutes={scrollOffsetMinutes}
        ampm={ampm}
        showTime={showTime}
        onPressCell={onPressCell}
        onPressEvent={onPressEvent}
        onSwipeHorizontal={onSwipeHorizontal}
        renderEvent={renderEvent}
        headerComponent={headerComponent}
        headerComponentStyle={headerComponentStyle}
        isEventOrderingEnabled={isEventOrderingEnabled}
        hours={hours}
        startHour={startHour}
      />
    </>
  );
};
