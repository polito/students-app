import { Booking, Deadline, ExamStatusEnum } from '@polito/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { DateTime, Duration, Interval } from 'luxon';

import { CoursesPreferences } from '../../../core/contexts/PreferencesContext';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetDeadlineWeeks } from '../../../core/queries/studentHooks';
import { Exam } from '../../../core/types/api';
import { formatMachineDate, formatTime } from '../../../utils/dates';
import { getPageByPageParam } from '../../../utils/queries';
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
import { Lecture } from '../types/Lecture';
import { useGetLectureWeeks } from './lectureHooks';

export const AGENDA_QUERY_PREFIX = 'agenda';
export const AGENDA_FILTERS_KEY = ['agendaFilters'];

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
    ...exams
      .filter(exam => exam.status === ExamStatusEnum.Booked)
      .map(exam => {
        const coursePreferences = coursesPreferences[exam.uniqueShortcode];

        const item: ExamItem = {
          id: exam.id,
          key: 'exam' + exam.id,
          type: 'exam',
          color: coursePreferences?.color,
          icon: coursePreferences?.icon,
          date: formatMachineDate(exam.examStartsAt!),
          start: DateTime.fromJSDate(exam.examStartsAt!),
          end: DateTime.fromJSDate(exam.examEndsAt!),
          startTimestamp: exam.examStartsAt!.valueOf(),
          fromTime: formatTime(exam.examStartsAt!),
          isTimeToBeDefined: exam.isTimeToBeDefined,
          title: exam.courseName,
          places: exam?.places ?? [],
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
      const coursePreferences = lecture.uniqueShortcode
        ? coursesPreferences[lecture.uniqueShortcode]
        : undefined;
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
        color: coursePreferences?.color,
        icon: coursePreferences?.icon,
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
        id: deadline.id!,
        key: 'deadline-' + deadline.id,
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
  startDate: DateTime = thisMonday,
) => {
  const examsQuery = useGetExams();
  const bookingsQuery = useGetBookings();
  const lecturesQuery = useGetLectureWeeks(coursesPreferences);
  const deadlinesQuery = useGetDeadlineWeeks();

  const filtersQuery = useGetAgendaTypesFilter();

  const oneWeek = Duration.fromDurationLike({ week: 1 });

  return useInfiniteQuery<AgendaWeek>(
    [AGENDA_QUERY_PREFIX, filtersQuery.data],
    async ({ pageParam = startDate }: { pageParam?: DateTime }) => {
      let queryFilters: AgendaTypesFilterState;

      // if all filters are set to false, set all query filters to true
      if (ALL_AGENDA_TYPES.every(type => !filtersQuery.data[type])) {
        queryFilters = {
          exam: true,
          booking: true,
          lecture: true,
          deadline: true,
        };
      } else {
        queryFilters = { ...filtersQuery.data };
      }

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

      const key = pageParam.toSQLDate()!;

      const [lectures, deadlines] = await Promise.all([
        queryFilters.lecture
          ? getPageByPageParam(lecturesQuery, pageParam)
          : Promise.resolve([]),
        queryFilters.deadline
          ? getPageByPageParam(deadlinesQuery, pageParam)
          : Promise.resolve([]),
      ]);

      const days = groupItemsByDay(
        coursesPreferences,
        exams,
        bookings,
        lectures,
        deadlines,
        pageParam === thisMonday,
      );

      return {
        key,
        dateRange: Interval.fromDateTimes(pageParam, until),
        data: days,
      };
    },
    {
      enabled:
        !!lecturesQuery.data &&
        !!examsQuery.data &&
        !!bookingsQuery.data &&
        !!deadlinesQuery.data,
      networkMode: 'always',
      getNextPageParam: lastPage => {
        return lastPage.dateRange.start?.plus(oneWeek) ?? startDate;
      },
      getPreviousPageParam: firstPage => {
        return firstPage.dateRange.start?.minus(oneWeek);
      },
      staleTime: 300000, // TODO define
    },
  );
};

export const useGetAgendaTypesFilter = () => {
  return useQuery<AgendaTypesFilterState>(
    AGENDA_FILTERS_KEY,
    () => {
      return {
        exam: false,
        booking: false,
        lecture: false,
        deadline: false,
      };
    },
    {
      staleTime: Infinity,
      initialData: {
        exam: false,
        booking: false,
        lecture: false,
        deadline: false,
      },
    },
  );
};
