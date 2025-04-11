import { useMemo } from 'react';
import hex_md5 from 'react-native-uuid/dist/md5';

import { Lecture as ApiLecture, LecturesApi } from '@polito/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { DateTime } from 'luxon';

import { CoursesPreferences } from '../../../core/contexts/PreferencesContext';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { toOASTruncable } from '../../../utils/dates.ts';
import { pluckData } from '../../../utils/queries';
import { Lecture } from '../types/Lecture';

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

const getLectureWeekQueryKey = (
  monday: DateTime,
  visibleCourseIds: number[],
) => {
  const val = hex_md5(JSON.stringify(visibleCourseIds));
  return [LECTURES_QUERY_PREFIX, monday, val];
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

  return useQuery<Lecture[]>(
    getLectureWeekQueryKey(since, visibleCourseIds),
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
      queryKey: getLectureWeekQueryKey(monday, visibleCourseIds),
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

  const refetch = async () => {
    await Promise.all(
      queries.map(q => {
        if (q.refetch) {
          return q.refetch();
        }
      }),
    );
  };

  return {
    data: queries.map(query => query.data!),
    isLoading,
    refetch,
  };
};
