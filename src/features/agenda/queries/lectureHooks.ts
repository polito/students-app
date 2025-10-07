import { useMemo } from 'react';

import { Lecture as ApiLecture, LecturesApi } from '@polito/api-client';
import { ResponseError } from '@polito/api-client/runtime';
import { useQueries, useQuery } from '@tanstack/react-query';

import { DateTime } from 'luxon';

import {
  CoursesPreferences,
  usePreferencesContext,
} from '../../../core/contexts/PreferencesContext';
import {
  useCoursesClient,
  useGetCourses,
} from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { APP_TIMEZONE } from '../../../utils/dates';
import { isCurrentMonth } from '../../../utils/dates';
import { toOASTruncable } from '../../../utils/dates.ts';
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
  const until = monday.endOf('week');

  return lectureClient
    .getLectures({
      fromDate: toOASTruncable(monday),
      toDate: toOASTruncable(until),
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

  return useQuery<Lecture[]>({
    queryKey: getLectureWeekQueryKey(since),
    queryFn: async () =>
      getLectureWeekQueryFn(lectureClient, since, courses!, visibleCourseIds),
    enabled: !!courses && Array.isArray(visibleCourseIds),
    staleTime: Infinity,
  });
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

export const useGetNextLecture = (courseId: number) => {
  const coursesClient = useCoursesClient();
  const { data: courses } = useGetCourses();
  const { courses: coursesPreferences } = usePreferencesContext();

  const nextLectureQuery = useQuery({
    queryKey: ['nextLecture', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      try {
        const response = await coursesClient.getNextLecture({ courseId });
        if (!response?.data) return null;
        let lecture = response.data as Lecture;
        if (courses) {
          // Check if the courseId passed to the hook is a module
          const parentCourse = courses.find(c =>
            c.modules?.some(module => module.id === courseId),
          );
          if (parentCourse) {
            const moduleIndex = parentCourse.modules?.findIndex(
              module => module.id === courseId,
            );
            if (moduleIndex !== undefined && moduleIndex >= 0) {
              // Use module's uniqueShortcode (parent + index + 1)
              const moduleUniqueShortcode = `${parentCourse.uniqueShortcode}${moduleIndex + 1}`;

              lecture = {
                ...lecture,
                uniqueShortcode: moduleUniqueShortcode,
              };
            } else {
              // Fallback to course's uniqueShortcode
              const course = courses.find(c => c.id === lecture.courseId);
              lecture = {
                ...lecture,
                uniqueShortcode: course?.uniqueShortcode,
              };
            }
          } else {
            // Regular course - use the course's uniqueShortcode
            const course = courses.find(c => c.id === lecture.courseId);
            lecture = { ...lecture, uniqueShortcode: course?.uniqueShortcode };
          }
        }
        return lecture;
      } catch (e) {
        if (e instanceof ResponseError && e.response.status === 404) {
          return null;
        }
        throw e;
      }
    },
    enabled: !!courseId && !!courses, // Aspetta anche che i corsi siano caricati
    staleTime: Infinity,
  });

  const { data } = nextLectureQuery;

  const { dayOfMonth, weekDay, monthOfYear, nextLecture } = useMemo(() => {
    const formattedNextLecture = data
      ? formatNextLecture(data, coursesPreferences)
      : null;
    if (!formattedNextLecture?.date) {
      return { dayOfMonth: '', weekDay: '', monthOfYear: '' };
    }

    try {
      const lectureStart = DateTime.fromISO(formattedNextLecture.date, {
        zone: APP_TIMEZONE,
      });

      if (!lectureStart.isValid) {
        return { dayOfMonth: '', weekDay: '', monthOfYear: '' };
      }

      return {
        nextLecture: formattedNextLecture,
        dayOfMonth: lectureStart.toFormat('d'),
        weekDay: lectureStart.toFormat('ccc'),
        monthOfYear: isCurrentMonth(lectureStart)
          ? ''
          : lectureStart.toFormat('LLL'),
      };
    } catch (error) {
      console.error('Error parsing lecture date:', error);
      return { dayOfMonth: '', weekDay: '', monthOfYear: '' };
    }
  }, [data, coursesPreferences]);

  return {
    dayOfMonth,
    weekDay,
    monthOfYear,
    isLoadingNextLecture: nextLectureQuery.isLoading,
    error: nextLectureQuery.error,
    nextLecture,
  };
};
