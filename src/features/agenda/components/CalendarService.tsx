// import { DateTime } from 'luxon';
//
// export class CalendarService {
//   calendar = { weeks: [{ days: [] }] };
//   month = [];
//
//   getCurrentMonth(selectedMonth) {
//     this.month = [];
//
//     // ritorna il primo giorno del mese come istante di tempo
//     let startMonth = DateTime.fromJSDate(selectedMonth).startOf('month');
//     const prevMonth = DateTime.fromJSDate(selectedMonth)
//       .startOf('month')
//       .minus({ days: 1 });
//     // prevMonth diventa l'ultimo giorno del mese precedente
//     let fored = false;
//     const endMonth = DateTime.fromJSDate(selectedMonth).endOf('month');
//
//     // se il giorno di partenza è domenica, fissa startMonth al
//     // lunedì del mese precedente
//     if (startMonth.weekday === 0) {
//       startMonth = startMonth.minus({ days: 6 });
//       fored = true;
//     } else if (startMonth.weekday > 1) {
//       // lo resettiamo a lunedì
//       startMonth = startMonth.plus({
//         days: 1 - startMonth.weekday,
//       });
//       fored = true;
//     }
//
//     if (fored) {
//       for (let i = startMonth.day; i <= prevMonth.day; i++) {
//         this.month.push({
//           date: startMonth.toJSDate(),
//           day: startMonth.weekday,
//           otherMonth: true,
//         });
//         startMonth = startMonth.plus({ days: 1 });
//       }
//       startMonth = DateTime.fromJSDate(selectedMonth).startOf('month');
//     }
//
//     for (let i = startMonth.day; i <= endMonth.day; i++) {
//       this.month.push({
//         date: startMonth.toJSDate(),
//         day: startMonth.weekday,
//       });
//       startMonth = startMonth.plus({ days: 1 });
//     }
//
//     if (endMonth.weekday === 6) {
//       this.month.push({
//         date: startMonth.toJSDate(),
//         day: startMonth.weekday,
//         otherMonth: true,
//       });
//     } else if (endMonth.weekday < 6 && endMonth.weekday !== 0) {
//       for (let i = endMonth.weekday; i < 7; i++) {
//         this.month.push({
//           date: startMonth.toJSDate(),
//           day: startMonth.weekday,
//           otherMonth: true,
//         });
//         startMonth = startMonth.plus({ days: 1 });
//       }
//     }
//   }
//
//   // Divide in settimane
//   getMonthCalendar(selectedMonth) {
//     this.calendar = { weeks: [{ days: [] }] };
//     this.getCurrentMonth(selectedMonth);
//     let i = 0;
//     let week = 0;
//     while (i < this.month.length) {
//       for (let j = 0; j < 7; j++) {
//         if (this.month[i]) {
//           this.calendar.weeks[week].days.push({
//             date: this.month[i].date,
//             day: this.month[i].day,
//             monthDay: this.month[i].date.getDay(),
//             otherMonth: this.month[i].otherMonth,
//             daysFromToday: ~~DateTime.fromJSDate(this.month[i].date).diff(
//               DateTime.local().startOf('day'),
//               'days',
//             ).days,
//           });
//
//           if (i <= this.month.length) {
//             i++;
//           }
//         }
//       }
//       if (i < this.month.length) {
//         this.calendar.weeks.push({ days: [] });
//         week++;
//       }
//     }
//     return this.calendar;
//   }
// }
