import { Colors } from '@lib/ui/types/theme';
import { Booking, Exam } from '@polito-it/api-client';

import { DateTime } from 'luxon';

import { AgendaItem } from '../../utils/types';

export const mapAgendaItem = (
  exams: Exam[],
  bookings: Booking[],
  colors: Colors,
) => {
  const events: Record<string, AgendaItem[]> = {};

  exams.forEach(exam => {
    const fromDate = exam.examStartsAt.toISOString();
    const toDate = exam.bookingEndsAt?.toISOString();
    const ISODate = DateTime.fromISO(fromDate).toISO();
    const item: AgendaItem = {
      fromDate: fromDate,
      toDate: toDate,
      content: exam,
      type: 'Exam',
    };
    if (events[ISODate]) events[ISODate].push(item);
    else events[ISODate] = [item];
  });

  bookings.forEach(booking => {
    const fromDate = booking.startsAt.toISOString();
    const toDate = booking.endsAt.toISOString();
    const ISODate = DateTime.fromISO(fromDate).toISO();
    const item: AgendaItem = {
      fromDate: fromDate,
      toDate: toDate,
      content: booking,
      type: 'Booking',
    };
    if (events[ISODate]) events[ISODate].push(item);
    else events[ISODate] = [item];
  });

  console.log('events', events);

  return events;
};
