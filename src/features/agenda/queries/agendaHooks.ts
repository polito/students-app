import { useMemo } from 'react';

import { Booking, Deadline, ExamStatusEnum } from '@polito/api-client';
import { UseQueryResult, useQueries, useQuery } from '@tanstack/react-query';

import { DateTime, IANAZone, Interval } from 'luxon';

import {
  CoursesPreferences,
  PreferencesContextProps,
  usePreferencesContext,
} from '../../../core/contexts/PreferencesContext';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import {
  useGetDeadlineWeek,
  useGetDeadlineWeeks,
} from '../../../core/queries/studentHooks';
import { Exam } from '../../../core/types/api';
import { dateFormatter, formatMachineDate } from '../../../utils/dates';
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
import { useGetLectureWeek, useGetLectureWeeks } from './lectureHooks';

export const AGENDA_QUERY_PREFIX = 'agenda';

const groupItemsByDay = (
  coursesPreferences: CoursesPreferences,
  exams: Exam[],
  bookings: Booking[],
  lectures: Lecture[],
  deadlines: Deadline[],
  includesToday: boolean,
): AgendaDay[] => {
  const agendaItems: AgendaItem[] = [];

  const timeOptions = {
    zone: IANAZone.create('Europe/Rome'),
  };
  const formatHHmm = dateFormatter('HH:mm');
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
          start: DateTime.fromJSDate(exam.examStartsAt!, timeOptions),
          end: DateTime.fromJSDate(exam.examEndsAt!, timeOptions),
          startTimestamp: exam.examStartsAt!.valueOf(),
          fromTime: formatHHmm(exam.examStartsAt!),
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
        fromTime: formatHHmm(booking.startsAt!),
        toTime: formatHHmm(booking.endsAt!),
        start: DateTime.fromJSDate(booking.startsAt!, timeOptions),
        end: DateTime.fromJSDate(booking.endsAt!, timeOptions),
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
        start: DateTime.fromJSDate(lecture.startsAt, timeOptions),
        end: DateTime.fromJSDate(lecture.endsAt, timeOptions),
        date: formatMachineDate(lecture.startsAt),
        startTimestamp: lecture.startsAt.valueOf(),
        fromTime: formatHHmm(lecture.startsAt),
        toTime: formatHHmm(lecture.endsAt),
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
        start: DateTime.fromJSDate(startDate, timeOptions),
        end: DateTime.fromJSDate(startDate, timeOptions).plus({ hour: 1 }),
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

interface AgendaWeekQueryFnParams {
  preferences: PreferencesContextProps;
  startDate: DateTime;
  examsData: Exam[];
  bookingsData: Booking[];
  lecturesData: Lecture[];
  deadlinesData: Deadline[];
}

export const getAgendaWeekQueryKey = (
  filters: AgendaTypesFilterState,
  startDate: DateTime,
) => [AGENDA_QUERY_PREFIX, filters, startDate];

const getAgendaWeekQueryFn = async ({
  preferences,
  startDate,
  examsData,
  bookingsData,
  lecturesData,
  deadlinesData,
}: AgendaWeekQueryFnParams): Promise<AgendaWeek> => {
  let queryFilters: AgendaTypesFilterState;

  // if all filters are set to false, set all query filters to true
  if (ALL_AGENDA_TYPES.every(type => !preferences.agendaScreen.filters[type])) {
    queryFilters = {
      exam: true,
      booking: true,
      lecture: true,
      deadline: true,
    };
  } else {
    queryFilters = { ...preferences.agendaScreen.filters };
  }

  const until = startDate.plus({ week: 1 });

  const jsSince = startDate.toJSDate();
  const jsUntil = until.toJSDate();

  let bookings: Booking[] = [],
    deadlines: Deadline[] = [],
    exams: Exam[] = [],
    lectures: Lecture[] = [];
  if (queryFilters.booking) {
    bookings = bookingsData.filter(
      b => b.startsAt && b.startsAt > jsSince && b.startsAt < jsUntil,
    );
  }

  if (queryFilters.deadline) {
    deadlines = deadlinesData;
  }

  if (queryFilters.exam) {
    exams = examsData.filter(
      e =>
        e.examStartsAt && e.examStartsAt > jsSince && e.examStartsAt < jsUntil,
    );
  }

  if (queryFilters.lecture) {
    lectures = lecturesData;
  }

  const days = groupItemsByDay(
    preferences.courses,
    exams,
    bookings,
    lectures,
    deadlines,
    startDate === thisMonday,
  );

  return {
    key: startDate.toSQLDate()!,
    dateRange: Interval.fromDateTimes(startDate, until),
    data: days,
  };
};

export const useGetAgendaWeek = (startDate: DateTime = thisMonday) => {
  const preferences = usePreferencesContext();

  const examsQuery = useGetExams();
  const bookingsQuery = useGetBookings();
  const lecturesQuery = useGetLectureWeek(preferences.courses, startDate);
  const deadlinesQuery = useGetDeadlineWeek(startDate);

  return useQuery<AgendaWeek>(
    getAgendaWeekQueryKey(preferences.agendaScreen.filters, startDate),
    async () =>
      getAgendaWeekQueryFn({
        preferences,
        startDate,
        examsData: examsQuery.data!,
        bookingsData: bookingsQuery.data!,
        lecturesData: lecturesQuery.data!,
        deadlinesData: deadlinesQuery.data!,
      }),
    {
      enabled:
        !!lecturesQuery.data &&
        !!examsQuery.data &&
        !!bookingsQuery.data &&
        !!deadlinesQuery.data,
      networkMode: 'always',
      staleTime: 300000, // TODO define
    },
  );
};

export const useGetAgendaWeeks = (mondays: DateTime[]) => {
  const preferences = usePreferencesContext();

  const examsQuery = useGetExams();
  const bookingsQuery = useGetBookings();
  const lecturesQueries = useGetLectureWeeks(preferences.courses, mondays);
  const deadlinesQueries = useGetDeadlineWeeks(mondays);

  const queries = useQueries<AgendaWeek[]>({
    queries: mondays.map((monday, index) => ({
      queryKey: getAgendaWeekQueryKey(preferences.agendaScreen.filters, monday),
      queryFn: () =>
        getAgendaWeekQueryFn({
          preferences,
          startDate: monday,
          examsData: examsQuery.data!,
          bookingsData: bookingsQuery.data!,
          lecturesData: lecturesQueries.data[index],
          deadlinesData: deadlinesQueries.data[index],
        }),
      enabled:
        !!examsQuery.data &&
        !!bookingsQuery.data &&
        !!lecturesQueries.data[index] &&
        !!deadlinesQueries.data[index],
      staleTime: Infinity,
    })),
  });

  const isLoading = useMemo(() => {
    if (!mondays?.length) return true;
    return queries.some(q => q.isLoading);
  }, [mondays, queries]);

  return {
    isLoading,
    data: (queries as UseQueryResult<AgendaWeek>[])
      .filter(q => q.data)
      .map(q => q.data!),
  };
};
