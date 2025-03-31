import { DateTime, Duration } from 'luxon';

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

export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

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

const STEP = 0.5;
const START = HOURS[0];
const END = HOURS[HOURS.length - 1];
const NUMCOL = 7;
const NUMROWS = (END - START) / STEP;

function lcm(values: number[]) {
  if (!values.length) {
    return 1;
  }
  const N = values.length;
  const vector = new Array(N);
  for (let n = 0; n < N; n++) {
    if (values[n] === 0) {
      vector[n] = 1;
    } else {
      vector[n] = values[n];
    }
  }
  let a = Math.abs(vector[0]),
    b,
    c;
  for (let n = 1; n < N; n++) {
    b = Math.abs(vector[n]);
    c = a;
    while (a && b) {
      if (a > b) {
        a %= b;
      } else {
        b %= a;
      }
    }
    a = Math.abs(c * vector[n]) / (a + b);
  }
  return a;
}

export function getStyledEvents<T extends ICalendarEventBase>(
  events: T[],
): T[] {
  if (!events.length) return [];

  const areAllDayEvents = events.some(event =>
    isAllDayEvent(event.start, event.end),
  );
  if (areAllDayEvents) {
    events = events.map(event => {
      return {
        ...event,
        start: event.start.set({ hour: 8 }),
        end: event.end.set({ hour: 21 }),
      };
    });
  }
  const orderedEvents = events
    .map(event => {
      const r0 = event.start.hour + (event.start.minute === 30 ? 0.5 : 0);
      const r1 = event.end.hour + (event.end.minute === 30 ? 0.5 : 0);
      const cells = [];
      const day = event.start.weekday - 1;
      for (let r = r0; r < r1; r += STEP) {
        const c = (r - START) / STEP;
        cells.push(c);
      }
      const newEvent = {
        ...event,
        day,
        r0,
        r1,
        cells,
      };
      return newEvent;
    })
    .sort((a, b) => {
      const startDiff = a.start.diff(b.start).valueOf();
      const endDiff = a.end.diff(b.end).valueOf();

      if (startDiff === 0) {
        if (endDiff !== 0) {
          return endDiff;
        } else {
          return a.title.localeCompare(b.title);
        }
      }
      return startDiff;
    });

  const slots = new Array(NUMCOL);
  const matrix = new Array(NUMCOL);
  const nums = new Array(NUMCOL);

  for (let c = 0; c < NUMCOL; c++) {
    slots[c] = new Array(NUMROWS);
    matrix[c] = new Array(NUMROWS);
    nums[c] = [];
    for (let r = 0; r < NUMROWS; r++) {
      slots[c][r] = 0;
    }
  }

  orderedEvents.forEach(event => {
    const n = event.cells.length;
    for (let i = 0; i < n; i++) {
      slots[event.day][event.cells[i]] += 1;
    }
  });

  const newEvents = orderedEvents
    .map(event => {
      const n = event.cells.length;
      let num = 0;
      for (let i = 0; i < n; i++) {
        num = Math.max(num, slots[event.day][event.cells[i]]);
      }
      const width = 100 / num;
      nums[event.day].push(num);
      return {
        ...event,
        width,
        num,
      };
    })
    .sort((a, b) => {
      const startDiff = a.start.diff(b.start).valueOf();
      const endDiff = a.end.diff(b.end).valueOf();
      if (a.start.day === b.start.day) {
        return b.num - a.num;
      } else if (startDiff === 0) {
        if (endDiff !== 0) {
          return endDiff;
        } else {
          return a.title.localeCompare(b.title);
        }
      }
      return a.start.diff(b.start).valueOf();
    });

  for (let c = 0; c < NUMCOL; c++) {
    const B = nums && nums[c] ? lcm(nums[c]) : 1;
    for (let a = 0; a < NUMROWS; a++) {
      matrix[c][a] = new Array(B);
      for (let b = 0; b < B; b++) {
        matrix[c][a][b] = 0;
      }
    }
  }

  let left: number, b0: number, b1: number;
  const finalEvents = newEvents.map(({ day, cells, num, ...rest }) => {
    const B = lcm(nums[day] ?? 1);
    const a0 = cells[0];
    const a1 = cells[cells.length - 1] + 1;
    for (let a = a0; a < a1; a++) {
      for (let b = 0; b < B; b++) {
        if (a === a0 && !matrix[day][a0][b]) {
          b0 = b;
          b1 = b0 + B / num;
          left = (100 / B) * b0;
          break;
        }
      }
      for (let b = b0; b < b1; b++) {
        matrix[day][a][b] = 1;
      }
    }
    return {
      ...rest,
      left,
    } as T;
  });

  return finalEvents;
}
