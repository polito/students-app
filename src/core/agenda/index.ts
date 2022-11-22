
import { Colors } from '@lib/ui/types/theme';
import { Booking, Deadline, Exam, Lecture } from '@polito-it/api-client';

import { DateTime } from 'luxon';

import { AgendaDayInterface, AgendaItemInterface } from '../../utils/types';
import { PreferencesContextProps } from '../contexts/PreferencesContext';

export const mapAgendaItem = (
  exams: Exam[],
  bookings: Booking[],
  lectures: Lecture[],
  deadlines: Deadline[],
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

  lectures.forEach(lecture => {
    const fromDate = lecture.startsAt.toISOString();
    const toDate = lecture.endsAt.toISOString();
    const ISODate = DateTime.fromISO(fromDate).toISODate();
    const item: AgendaItemInterface = {
      fromDate: fromDate,
      toDate: toDate,
      title: lecture?.type,
      content: lecture,
      type: 'Lecture',
      classroom: lecture.roomName || ' - ',
    };
    pushItemToList(item, ISODate);
  });

  deadlines.forEach(deadline => {
    // const fromDate = deadline.startsAt.toISOString();
    const toDate = deadline.endsAt.toISOString();
    const ISODate = DateTime.fromISO(toDate).toISODate();
    const item: AgendaItemInterface = {
      fromDate: toDate,
      toDate: toDate,
      title: deadline?.name,
      content: deadline,
      type: 'Deadline',
      classroom: ' - ',
    };
    pushItemToList(item, ISODate);
  });

  return agendaDays.sort(function (a, b) {
    return DateTime.fromISO(a.id) < DateTime.fromISO(b.id) ? -1 : 1;
  });
};

const agendaMonthPagination = 2;

export const getFromToDateFromPage = (page: number) => {
  // Carico due mesi alla volta, partendo da ora - 1 mese
  console.log('page', page);
  const fromDateIndex = -1 + agendaMonthPagination * page;
  const toDataIndex = 1 + agendaMonthPagination * page;
  const fromDate = DateTime.now().plus({ month: fromDateIndex }).toJSDate();
  const toDate = DateTime.now().plus({ month: toDataIndex }).toJSDate();
  // console.log('fromDate', DateTime.fromJSDate(fromDate).toISODate())
  // console.log('toDate', DateTime.fromJSDate(toDate).toISODate())
  return { fromDate, toDate };
};

export const getAgendaItemColorFromPreferences = (
  preferences: PreferencesContextProps,
  colors: Colors,
  item: AgendaItemInterface,
) => {
  if (item.type === 'Lecture') {
    const lecture = item.content as Lecture;
    return preferences.courses[lecture.courseId].color;
  }
  return preferences.types[item.type]?.color || colors.primary[500];
};
