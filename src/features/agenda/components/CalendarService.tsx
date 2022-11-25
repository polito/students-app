import { DateTime } from 'luxon';

export interface CalendarBean {
  weeks: Week[];
}
export interface Week {
  days: Day[];
}
export interface Day {
  date: Date;
  day: number;
  otherMonth?: boolean;
  monthDay?: number;
  daysFromToday?: number;
}

export class CalendarService {
  calendar: CalendarBean = { weeks: [{ days: [] }] };
  month: Day[] = [];

  getCurrentMonth(selectedMonth: Date) {
    this.month = [];

    // returns the first day of the month as an instant of time
    let startMonth = DateTime.fromJSDate(selectedMonth).startOf('month');
    const prevMonth = DateTime.fromJSDate(selectedMonth)
      .startOf('month')
      .minus({ days: 1 });

    // prevMonth becomes the last day of the previous month
    let fored = false;
    const endMonth = DateTime.fromJSDate(selectedMonth).endOf('month');

    // if the departure day is Sunday, set startMonth to
    // Monday of the previous month
    // @ts-ignore
    if (startMonth.weekday === 0) {
      startMonth = startMonth.minus({ days: 6 });
      fored = true;
    } else if (startMonth.weekday > 1) {
      // lo resettiamo a lunedì
      startMonth = startMonth.plus({
        days: 1 - startMonth.weekday,
      });
      fored = true;
    }

    if (fored) {
      for (let i = startMonth.day; i <= prevMonth.day; i++) {
        this.month.push({
          date: startMonth.toJSDate(),
          day: startMonth.weekday,
          otherMonth: true,
        });
        startMonth = startMonth.plus({ days: 1 });
      }
      startMonth = DateTime.fromJSDate(selectedMonth).startOf('month');
    }

    for (let i = startMonth.day; i <= endMonth.day; i++) {
      this.month.push({
        date: startMonth.toJSDate(),
        day: startMonth.weekday,
      });
      startMonth = startMonth.plus({ days: 1 });
    }

    if (endMonth.weekday === 6) {
      this.month.push({
        date: startMonth.toJSDate(),
        day: startMonth.weekday,
        otherMonth: true,
      });
    } else {
      // @ts-ignore
      if (endMonth.weekday < 6 && endMonth.weekday !== 0) {
        for (let i = endMonth.weekday; i < 7; i++) {
          this.month.push({
            date: startMonth.toJSDate(),
            day: startMonth.weekday,
            otherMonth: true,
          });
          startMonth = startMonth.plus({ days: 1 });
        }
      }
    }
  }

  // Divide in settimane
  getMonthCalendar(selectedMonth: Date) {
    this.calendar = { weeks: [{ days: [] }] };
    this.getCurrentMonth(selectedMonth);
    let i = 0;
    let week = 0;
    while (i < this.month.length) {
      for (let j = 0; j < 7; j++) {
        if (this.month[i]) {
          const luxonDate = DateTime.fromJSDate(this.month[i].date);
          this.calendar.weeks[week].days.push({
            date: this.month[i].date,
            day: this.month[i].day,
            monthDay: Number(luxonDate.toFormat('dd')),
            otherMonth: this.month[i].otherMonth,
            daysFromToday: Number(
              luxonDate
                .diff(DateTime.local().startOf('day'), 'days')
                .days.toFixed(0),
            ),
          });

          if (i <= this.month.length) {
            i++;
          }
        }
      }
      if (i < this.month.length) {
        this.calendar.weeks.push({ days: [] });
        week++;
      }
    }
    return this.calendar;
  }
}
