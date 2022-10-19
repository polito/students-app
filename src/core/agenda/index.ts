import { Colors } from '@lib/ui/types/theme';
import { Booking, Exam } from '@polito-it/api-client';

import { agendaMockEvents } from '../../utils/mock';
import { AgendaItem } from '../../utils/types';

export const mapAgendaItem = (
  exams: Exam[],
  bookings: Booking[],
  colors: Colors,
) => {
  const events: any = [];

  exams.forEach(exam => {
    const ISODate = exam.examStartsAt.toISOString();
    const index = events.findIndex((el: Exam) => el === ISODate);
    const item: AgendaItem = {
      fromDate: ISODate,
      toDate: ISODate,
      content: exam,
      type: 'Exam',
    };
    if (index > -1) {
      events[index] = [...events[index], item];
    } else {
      events.push(ISODate);
      events[events.indexOf(ISODate)] = [item];
    }
  });

  bookings.forEach(booking => {
    const ISODate = booking.startsAt.toISOString();
    const index = events.findIndex((el: Exam) => el === ISODate);
    const item: AgendaItem = {
      fromDate: ISODate,
      toDate: ISODate,
      content: booking,
      type: 'Booking',
    };
    if (index > -1) {
      events[index] = [...events[index], item];
    } else {
      events.push(ISODate);
      events[events.indexOf(ISODate)] = [item];
    }
  });

  console.log('events', events.sort());

  return agendaMockEvents(colors);
};
