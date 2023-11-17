import { DateTime, Duration, Interval } from 'luxon';

import { ICalendarEventBase, Mode, WeekNum } from '../types/Calendar';

export const CALENDAR_CELL_HEIGHT = 60;

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

export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

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
  return `${String(hour).padStart(2, '0')}:00`;
}

export function isToday(date: DateTime) {
  return date.toISODate() === DateTime.now().toISODate();
}

export function getRelativeTopInDay(
  date: DateTime,
  hasAllDay = false,
  hours: number[] = HOURS,
  startHour = 8,
) {
  let offsetInMinutes = 60;
  const dayMinutes = hours.length * 60;
  if (date.hour > 0) {
    offsetInMinutes =
      (date.hour - (hasAllDay ? startHour - 1 : startHour)) * 60 + date.minute;
  }
  const minutesInDay = hasAllDay ? dayMinutes + 60 : dayMinutes;

  return (100 * offsetInMinutes) / minutesInDay;
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
  } else if (start.hour === 0) {
    return true;
  }
  return false;
}

/**
 * Returns the maximum number of overlapping events in eventList during the time of event
 *
 * @param event
 * @param eventList
 */
export function getMaxOverlappingEventsCount(
  event: ICalendarEventBase,
  eventList: ICalendarEventBase[],
) {
  let maxOverlappingEventsCount = 0,
    currentOverlappingEventsCount = 0;
  let overlap: Interval;

  eventList.forEach(eventItem => {
    if (
      eventItem === event ||
      event.start >= eventItem.end ||
      event.end <= eventItem.start
    ) {
      return;
    }

    const eventOverlap = Interval.fromDateTimes(
      DateTime.max(event.start, eventItem.start),
      DateTime.min(event.end, eventItem.end),
    );

    if (!overlap || !overlap.overlaps(eventOverlap)) {
      overlap = eventOverlap;
      currentOverlappingEventsCount = 0;
    } else {
      overlap = overlap.union(eventOverlap);
    }

    currentOverlappingEventsCount++;

    if (currentOverlappingEventsCount > maxOverlappingEventsCount) {
      maxOverlappingEventsCount = currentOverlappingEventsCount;
    }
  });

  // Count the  number of items in eventList
  // included between event since and event until
  // with an overlap of at least 1 minute
  return maxOverlappingEventsCount + 1;
}

export function getStyleForOverlappingEvent(
  eventPosition: number,
  eventCount: number,
) {
  const start = (eventPosition / eventCount) * 98;
  const end = ((eventPosition + 1) / eventCount) * 98;
  return {
    start: `${start}%`,
    end: `${end}%`,
  };
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
