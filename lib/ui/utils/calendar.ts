import { DateTime, Duration } from 'luxon';

import { ICalendarEventBase, Mode, WeekNum } from '../types/Calendar';

export const DAY_MINUTES = 1440;
export const MIN_HEIGHT = 1200;
export const OVERLAP_OFFSET = 8;

export function getDatesInMonth(date: DateTime = DateTime.now()): DateTime[] {
  return Array(date.daysInMonth! - 1)
    .fill(0)
    .map((_, i) => {
      return date.plus(Duration.fromDurationLike({ day: i + 1 }));
    });
}

export function getDatesInWeek(
  date: DateTime = DateTime.now(),
  weekStartsOn: WeekNum = 0,
): DateTime[] {
  const dayOfWeek = date.weekday;
  return Array(7)
    .fill(0)
    .map((_, i) => {
      return date.plus(
        Duration.fromDurationLike({
          day:
            i -
            (dayOfWeek < weekStartsOn ? 7 + dayOfWeek : dayOfWeek) +
            weekStartsOn,
        }),
      );
    });
}

export function getDatesInNextThreeDays(
  date: DateTime = DateTime.now(),
): DateTime[] {
  return Array(3)
    .fill(0)
    .map((_, i) => {
      return date.plus(Duration.fromDurationLike({ day: i }));
    });
}

export function getDatesInNextOneDay(date: DateTime = DateTime.now()) {
  return [date];
}

export const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function formatHour(hour: number, ampm = false) {
  if (ampm) {
    if (hour === 0) {
      return '';
    }
    if (hour === 12) {
      return `12 PM`;
    }
    if (hour > 12) {
      return `${hour - 12} PM`;
    }
    return `${hour} AM`;
  }
  return `${hour}:00`;
}

export function isToday(date: DateTime) {
  return date.toISODate() === DateTime.now().toISODate();
}

export function getRelativeTopInDay(date: DateTime) {
  return (100 * (date.hour * 60 + date.minute)) / DAY_MINUTES;
}

export function todayInMinutes() {
  const today = DateTime.now();
  return today.diff(today.startOf('day'), 'minute');
}

export function modeToDaysCount(mode: Mode, current: DateTime): number {
  switch (mode) {
    case 'day':
      return 1;
    case '3days':
      return 3;
    case 'week':
    case 'custom':
      return 7;
    case 'month':
      return current.daysInMonth! - current.day + 1;
    default:
      throw new Error('undefined mode');
  }
}

export function formatStartEnd(start: DateTime, end: DateTime, format: string) {
  return `${start.toFormat(format)} - ${end.toFormat(format)}`;
}

export function isAllDayEvent(start: DateTime, end: DateTime) {
  if (!start.hasSame(end, 'day')) {
    return true;
  } else if (start.hour === 0 && end.hour === 23) {
    return true;
  }
  return false;
}

export function getCountOfEventsAtEvent(
  event: ICalendarEventBase,
  eventList: ICalendarEventBase[],
) {
  // return eventList.filter(
  //   e =>
  //     dayjs(event.start).isBetween(e.start, e.end, 'minute', '[)') ||
  //     dayjs(e.start).isBetween(event.start, event.end, 'minute', '[)'),
  // ).length;
  return 1;
}

export function getOrderOfEvent(
  event: ICalendarEventBase,
  eventList: ICalendarEventBase[],
) {
  // const events = eventList
  //   .filter(
  //     e =>
  //       dayjs(event.start).isBetween(e.start, e.end, 'minute', '[)') ||
  //       dayjs(e.start).isBetween(event.start, event.end, 'minute', '[)'),
  //   )
  //   .sort((a, b) => {
  //     if (dayjs(a.start).isSame(b.start)) {
  //       return dayjs(a.start).diff(a.end) < dayjs(b.start).diff(b.end) ? -1 : 1;
  //     } else {
  //       return dayjs(a.start).isBefore(b.start) ? -1 : 1;
  //     }
  //   });
  // const index = events.indexOf(event);
  // return index === -1 ? 0 : index;
  return 0;
}

export function getStyleForOverlappingEvent(
  eventPosition: number,
  overlapOffset: number,
) {
  let overlapStyle = {};
  const offset = overlapOffset;
  const start = eventPosition * offset;
  const zIndex = 100 + eventPosition;
  overlapStyle = {
    start: start + 100, // OVERLAP_PADDING
    end: 100,
    zIndex,
  };
  return overlapStyle;
}

export function getDatesInNextCustomDays(
  date: DateTime = DateTime.now(),
  weekStartsOn: WeekNum = 0,
  weekEndsOn: WeekNum = 6,
) {
  const dayOfWeek = date.weekday;
  return Array(weekDaysCount(weekStartsOn, weekEndsOn))
    .fill(0)
    .map((_, i) => {
      return date.plus(
        Duration.fromDurationLike({
          day: i - dayOfWeek + weekStartsOn,
        }),
      );
    });
}

// TODO: This method should be unit-tested
function weekDaysCount(weekStartsOn: WeekNum, weekEndsOn: WeekNum) {
  // handle reverse week
  if (weekEndsOn < weekStartsOn) {
    let daysCount = 1;
    let i = weekStartsOn;
    while (i !== weekEndsOn) {
      ++i;
      ++daysCount;
      if (i > 6) {
        i = 0;
      }
      // fallback for infinite
      if (daysCount > 7) {
        break;
      }
    }
    return daysCount;
  }
  // normal week
  if (weekEndsOn > weekStartsOn) {
    return weekEndsOn - weekStartsOn + 1;
  }
  // default
  return 1;
}

export function getEventSpanningInfo(
  event: ICalendarEventBase,
  date: DateTime,
  dayOfTheWeek: number,
  calendarWidth: number,
  showAdjacentMonths: boolean,
) {
  const dayWidth = calendarWidth / 7;

  const eventDuration = Math.ceil(event.end.diff(event.start).days);
  const eventDaysLeft = Math.ceil(event.end.diff(date).days);
  const weekDaysLeft = 7 - dayOfTheWeek;
  const monthDaysLeft = date.endOf('month').day - date.day;
  // This is to determine how many days from the event to show during a week
  const eventWeekDuration =
    !showAdjacentMonths && monthDaysLeft < 7 && monthDaysLeft < eventDuration
      ? monthDaysLeft + 1
      : eventDaysLeft > weekDaysLeft
      ? weekDaysLeft
      : eventDaysLeft < eventDuration
      ? eventDaysLeft
      : eventDuration;
  // - 6 to take in account the padding
  const eventWidth = dayWidth * eventWeekDuration - 6;

  return { eventWidth, eventWeekDuration };
}

export function getWeeksWithAdjacentMonths(
  targetDate: DateTime,
  weekStartsOn: WeekNum,
) {
  // TODO is this really needed?
  // let weeks = calendarize(targetDate.toDate(), weekStartsOn);
  // const firstDayIndex = weeks[0].findIndex(d => d === 1);
  // const lastDay = targetDate.endOf('month').date();
  // const lastDayIndex = weeks[weeks.length - 1].findIndex(d => d === lastDay);
  //
  // weeks = weeks.map((week, iw) => {
  //   return week.map((d, id) => {
  //     if (d !== 0) {
  //       return d;
  //     } else if (iw === 0) {
  //       return d - (firstDayIndex - id - 1);
  //     } else {
  //       return lastDay + (id - lastDayIndex);
  //     }
  //   }) as Week;
  // });
  //
  // return weeks;
}
