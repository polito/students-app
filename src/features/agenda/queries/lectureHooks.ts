import { useMemo } from 'react';

import { Lecture as ApiLecture, LecturesApi } from '@polito/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { DateTime, IANAZone } from 'luxon';

import { CoursesPreferences } from '../../../core/contexts/PreferencesContext';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { isCurrentMonth } from '../../../utils/dates';
import { pluckData } from '../../../utils/queries';
import { Lecture } from '../types/Lecture';
import { formatNextLecture } from '../utils/formatters';

export const LECTURES_QUERY_PREFIX = 'lectures';

const addUniqueShortcodeToLectures = (
  lectures: ApiLecture[],
  courses: CourseOverview[],
): Lecture[] => {
  return lectures.map(lecture => ({
    ...lecture,
    uniqueShortcode: courses!.find(course => course.id === lecture.courseId)
      ?.uniqueShortcode,
  }));
};

const useLectureClient = (): LecturesApi => {
  return new LecturesApi();
};

/**
 * Visible courses are the ones not hidden in preferences
 * and belonging to the study plan of the active career
 */
const getVisibleCourseIds = (
  courses: CourseOverview[],
  coursesPreferences: CoursesPreferences,
) => {
  if (!courses) return [];

  const hiddenUniqueShortcodes = Object.entries(coursesPreferences)
    .filter(([_, prefs]) => prefs.isHidden)
    .map(([uniqueShortcode]) => uniqueShortcode);

  return courses
    .filter(
      course =>
        course.id !== null &&
        !hiddenUniqueShortcodes.includes(course.uniqueShortcode),
    )
    .map(course => course.id as number);
};

const getLectureWeekQueryKey = (monday: DateTime) => {
  return [LECTURES_QUERY_PREFIX, monday];
};

const getLectureWeekQueryFn = async (
  lectureClient: LecturesApi,
  monday: DateTime,
  courses: CourseOverview[],
  visibleCourseIds: number[],
) => {
  const until = monday.plus({ week: 1 });

  return lectureClient
    .getLectures({
      fromDate: monday.toJSDate(),
      toDate: until.toJSDate(),
      courseIds: visibleCourseIds,
    })
    .then(pluckData)
    .then(l => addUniqueShortcodeToLectures(l, courses!));
};

export const useGetLectureWeek = (
  coursesPreferences: CoursesPreferences,
  since: DateTime = DateTime.now().startOf('week'),
) => {
  const lectureClient = useLectureClient();
  const { data: courses } = useGetCourses();

  const visibleCourseIds = useMemo(() => {
    return getVisibleCourseIds(courses!, coursesPreferences);
  }, [courses, coursesPreferences]);

  return useQuery<Lecture[]>(
    getLectureWeekQueryKey(since),
    async () =>
      getLectureWeekQueryFn(lectureClient, since, courses!, visibleCourseIds),
    {
      enabled: !!courses && Array.isArray(visibleCourseIds),
      staleTime: Infinity,
    },
  );
};

export const useGetLectureWeeks = (
  coursesPreferences: CoursesPreferences,
  mondays: DateTime[] = [DateTime.now().startOf('week')],
) => {
  const lectureClient = useLectureClient();
  const { data: courses } = useGetCourses();

  const visibleCourseIds = useMemo(() => {
    return getVisibleCourseIds(courses!, coursesPreferences);
  }, [courses, coursesPreferences]);

  const queries = useQueries({
    queries: mondays.map(monday => ({
      queryKey: getLectureWeekQueryKey(monday),
      queryFn: async () =>
        getLectureWeekQueryFn(
          lectureClient,
          monday,
          courses!,
          visibleCourseIds,
        ),
    })),
  });

  const isLoading = useMemo(() => {
    return queries.some(query => query.isLoading);
  }, [queries]);

  return {
    data: queries.map(query => query.data!),
    isLoading,
  };
};

export const useGetNextLecture = (
  courseId: number,
  coursesPreferences: CoursesPreferences,
) => {
  const lectureClient = useLectureClient();
  const { data: courses } = useGetCourses();
  const [nextLectureQuery] = useQueries({
    queries: [
      {
        queryKey: ['nextLecture', courseId],
        queryFn: async () => {
          const now = DateTime.now().setZone('Europe/Rome');
          const fromDate = now.toJSDate();
          const toDate = now.plus({ week: 3 }).toJSDate();
          const lectures = await lectureClient
            .getLectures({
              fromDate,
              toDate,
              courseIds: [courseId],
            })
            .then(pluckData)
            .then(l => addUniqueShortcodeToLectures(l, courses!));
          if (lectures.length > 0) {
            return formatNextLecture(lectures[0], coursesPreferences);
          }
          return undefined;
        },
        enabled: !!courseId,
        staleTime: Infinity,
      },
    ],
  });

  const nextLecture = nextLectureQuery.data;
  const { dayOfMonth, weekDay, monthOfYear } = useMemo(() => {
    if (!nextLecture) return { dayOfMonth: '', weekDay: '', monthOfYear: '' };
    const lectureStart = DateTime.fromISO(nextLecture.date, {
      zone: IANAZone.create('Europe/Rome'),
    });
    return {
      dayOfMonth: lectureStart.toFormat('d'),
      weekDay: lectureStart.toFormat('ccc'),
      monthOfYear: isCurrentMonth(lectureStart)
        ? ''
        : lectureStart.toFormat('LLL'),
    };
  }, [nextLecture]);

  return {
    nextLecture,
    dayOfMonth,
    weekDay,
    monthOfYear,
    isLoadingNextLecture: nextLectureQuery.isLoading,
    error: nextLectureQuery.error,
  };
};
