import { Colors } from '@lib/ui/types/theme';
import { Booking, Exam } from '@polito-it/api-client';

import { DateTime } from 'luxon';

import { AgendaDayInterface, AgendaItemInterface } from '../../utils/types';

export const mapAgendaItem = (
  exams: Exam[],
  bookings: Booking[],
  colors: Colors,
) => {
  const agendaDays: AgendaDayInterface[] = [];
  console.log({ colors });
  const pushItemToList = (item: AgendaItemInterface, ISODate: string) => {
    const currentAgendaDayIndex = agendaDays.findIndex(ad => ad.id === ISODate);
    if (currentAgendaDayIndex === -1) {
      agendaDays.push({
        id: ISODate,
        items: [item],
      });
    } else {
      agendaDays[currentAgendaDayIndex].items.push(item);
    }
  };

  exams.forEach(exam => {
    const fromDate = exam.examStartsAt.toISOString();
    const toDate = exam.bookingEndsAt?.toISOString();
    const ISODate = DateTime.fromISO(fromDate).toISODate();
    const item: AgendaItemInterface = {
      fromDate: fromDate,
      toDate: toDate,
      title: exam?.courseName,
      content: exam,
      type: 'Exam',
      classroom: exam?.classrooms,
    };
    pushItemToList(item, ISODate);
  });

  bookings.forEach(booking => {
    const fromDate = booking.startsAt.toISOString();
    const toDate = booking.endsAt.toISOString();
    const ISODate = DateTime.fromISO(fromDate).toISODate();
    const item: AgendaItemInterface = {
      fromDate: fromDate,
      toDate: toDate,
      title: booking?.topic?.title,
      content: booking,
      type: 'Booking',
      classroom: booking.location?.description || ' - ',
    };
    pushItemToList(item, ISODate);
  });

  console.log('agendaDays', agendaDays);

  return agendaDays;
};
