import { Booking, Deadline, Lecture } from '@polito/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';

import { DateTime, Duration, Interval } from 'luxon';

import { CoursesPreferences } from '../../../core/contexts/PreferencesContext';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetDeadlineWeeks } from '../../../core/queries/studentHooks';
import { Exam } from '../../../core/types/api';
import { formatMachineDate, formatTime } from '../../../utils/dates';
import { popPage, prefixKey, shiftPage } from '../../../utils/queries';
import { AgendaDay } from '../types/AgendaDay';
import {
  ALL_AGENDA_TYPES,
  AgendaItem,
  BookingItem,
  DeadlineItem,
  ExamItem,
  LectureItem,
} from '../types/AgendaItem';
import { AgendaTypesFilterState } from '../types/AgendaTypesFilterState';
import { AgendaWeek } from '../types/AgendaWeek';
import { useGetLectureWeeks } from './lectureHooks';

export const AGENDA_QUERY_KEY = 'agenda';

const groupItemsByDay = (
  coursesPreferences: CoursesPreferences,
  exams: Exam[],
  bookings: Booking[],
  lectures: Lecture[],
  deadlines: Deadline[],
  includesToday: boolean,
): AgendaDay[] => {
  const agendaItems: AgendaItem[] = [];

  agendaItems.push(
    ...exams.map(exam => {
      const coursePreferences = coursesPreferences[exam.courseId];
      const item: ExamItem = {
        id: exam.id,
        key: 'exam' + exam.id,
        type: 'exam',
        color: coursePreferences.color,
        icon: coursePreferences.icon,
        date: formatMachineDate(exam.examStartsAt!),
        start: DateTime.fromJSDate(exam.examStartsAt!),
        end: DateTime.fromJSDate(exam.examEndsAt!),
        startTimestamp: exam.examStartsAt!.valueOf(),
        fromTime: formatTime(exam.examStartsAt!),
        isTimeToBeDefined: exam.isTimeToBeDefined,
        title: exam.courseName,
        classroom: exam?.classrooms,
        teacherId: exam.teacherId,
      };
      return item;
    }),
  );

  agendaItems.push(
    ...bookings.map(booking => {
      const item: BookingItem = {
        id: booking.id,
        key: 'booking' + booking.id,
        type: 'booking',
        date: formatMachineDate(booking.startsAt!),
        startTimestamp: booking.startsAt!.valueOf(),
        fromTime: formatTime(booking.startsAt!),
        toTime: formatTime(booking.endsAt!),
        start: DateTime.fromJSDate(booking.startsAt!),
        end: DateTime.fromJSDate(booking.endsAt!),
        title: booking.topic.title,
      };
      return item;
    }),
  );

  agendaItems.push(
    ...lectures.map(lecture => {
      const coursePreferences = coursesPreferences[lecture.courseId];
      const item: LectureItem = {
        id: lecture.id,
        key: 'lecture' + lecture.id,
        type: 'lecture',
        start: DateTime.fromJSDate(lecture.startsAt),
        end: DateTime.fromJSDate(lecture.endsAt),
        date: formatMachineDate(lecture.startsAt),
        startTimestamp: lecture.startsAt.valueOf(),
        fromTime: formatTime(lecture.startsAt),
        toTime: formatTime(lecture.endsAt),
        title: lecture.courseName,
        courseId: lecture.courseId,
        color: coursePreferences.color,
        icon: coursePreferences.icon,
        place: lecture.place,
        teacherId: lecture.teacherId,
        virtualClassrooms: lecture.virtualClassrooms,
        description: lecture.description,
      };
      return item;
    }),
  );

  agendaItems.push(
    ...deadlines.map(deadline => {
      const startDate = deadline.date;
      startDate.setHours(0, 0, 0);

      const item: DeadlineItem = {
        key: 'deadline' + deadline.date.valueOf(),
        start: DateTime.fromJSDate(startDate),
        end: DateTime.fromJSDate(startDate).plus({ hour: 1 }),
        startTimestamp: deadline.date.valueOf(),
        date: formatMachineDate(deadline.date),
        title: deadline.name,
        type: 'deadline',
        url: deadline.url,
      };
      return item;
    }),
  );

  const daysMap = new Map<string, AgendaDay>();

  const today = DateTime.now().startOf('day');
  const todayString = today.toFormat('y-MM-dd');

  const agendaDays = agendaItems.reduce<Map<string, AgendaDay>>(
    (days, item) => {
      let day = days.get(item.date);
      if (!day) {
        day = {
          key: item.date,
          date: DateTime.fromSQL(item.date),
          isToday: item.date === todayString,
          items: [],
        };
      }

      day.items.push(item);
      days.set(item.date, day);

      return days;
    },
    daysMap,
  );

  if (includesToday && !daysMap.has(todayString)) {
    daysMap.set(todayString, {
      key: todayString,
      date: today,
      isToday: true,
      items: [],
    });
  }

  return [...agendaDays].sort().map(([_, day]) => {
    day.items.sort((a, b) => a.startTimestamp - b.startTimestamp);
    return day;
  });
};

const thisMonday = DateTime.now().startOf('week');

export const useGetAgendaWeeks = (
  coursesPreferences: CoursesPreferences,
  filters: AgendaTypesFilterState,
  startDate: DateTime = thisMonday,
) => {
  const examsQuery = useGetExams();
  const bookingsQuery = useGetBookings();
  const lecturesQuery = useGetLectureWeeks(coursesPreferences);
  const deadlinesQuery = useGetDeadlineWeeks();

  const oneWeek = Duration.fromDurationLike({ week: 1 });

  const filtersCount = Object.values(filters).filter(f => f).length;

  const queryFilters = Object.create(filters);

  if (!filtersCount) {
    ALL_AGENDA_TYPES.forEach(f => {
      queryFilters[f] = true;
    });
  }

  return useInfiniteQuery<AgendaWeek>(
    prefixKey([AGENDA_QUERY_KEY, JSON.stringify(queryFilters)]),
    async ({ pageParam = startDate }: { pageParam?: DateTime }) => {
      const until = pageParam.plus(oneWeek);

      const jsSince = pageParam.toJSDate();
      const jsUntil = until.toJSDate();

      let exams: Exam[] = [],
        bookings: Booking[] = [];

      if (queryFilters.exam) {
        exams = examsQuery.data!.filter(
          e =>
            e.examStartsAt &&
            e.examStartsAt > jsSince &&
            e.examStartsAt < jsUntil,
        );
      }

      if (queryFilters.booking) {
        bookings = bookingsQuery.data!.filter(
          b => b.startsAt && b.startsAt > jsSince && b.startsAt < jsUntil,
        );
      }

      let lectures: Lecture[] = [],
        deadlines: Deadline[] = [];

      if (pageParam < thisMonday) {
        // Retrieve a week back in time.
        // May cause an API call if data are not cached
        [lectures, deadlines] = await Promise.all([
          queryFilters.lecture
            ? lecturesQuery.fetchPreviousPage({ pageParam }).then(shiftPage)
            : [],
          queryFilters.deadline
            ? deadlinesQuery.fetchPreviousPage({ pageParam }).then(shiftPage)
            : [],
        ]);
      } else if (pageParam > thisMonday) {
        // Retrieve a week forward in time.
        // May cause an API call if data are not cached
        [lectures, deadlines] = await Promise.all([
          queryFilters.lecture
            ? lecturesQuery.fetchNextPage({ pageParam }).then(popPage)
            : [],
          queryFilters.deadline
            ? deadlinesQuery.fetchNextPage({ pageParam }).then(popPage)
            : [],
        ]);
      } else {
        // First page is already fetched, EZ
        if (queryFilters.lecture) {
          lectures = shiftPage(lecturesQuery);
        }

        if (queryFilters.deadline) {
          deadlines = shiftPage(deadlinesQuery);
        }
      }

      const days = groupItemsByDay(
        coursesPreferences,
        exams,
        bookings,
        lectures,
        deadlines,
        pageParam === thisMonday,
      );

      const key = pageParam.toSQLDate()!;

      return {
        key,
        dateRange: Interval.fromDateTimes(pageParam, until),
        data: days,
      };
    },
    {
      enabled:
        lecturesQuery.isSuccess &&
        examsQuery.isSuccess &&
        bookingsQuery.isSuccess &&
        deadlinesQuery.isSuccess,
      getNextPageParam: lastPage => {
        return lastPage.dateRange.start!.plus(oneWeek);
      },
      getPreviousPageParam: firstPage => {
        return firstPage.dateRange.start!.minus(oneWeek);
      },
      staleTime: Infinity, // TODO define
    },
  );
};
