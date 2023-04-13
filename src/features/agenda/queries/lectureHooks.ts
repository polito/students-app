import { useMemo } from 'react';

import { Lecture, LecturesApi } from '@polito/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';

import { DateTime, Duration } from 'luxon';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { CoursesPreferences } from '../../../core/contexts/PreferencesContext';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { notNullish } from '../../../utils/predicates';
import { prefixKey } from '../../../utils/queries';

export const LECTURES_QUERY_KEY = 'lectures';

const useLectureClient = (): LecturesApi => {
  const {
    clients: { lectures: lectureClient },
  } = useApiContext();
  return lectureClient!;
};

export const useGetLectureWeeks = (coursesPreferences: CoursesPreferences) => {
  const lectureClient = useLectureClient();
  const { data: courses } = useGetCourses();

  const oneWeek = Duration.fromDurationLike({ week: 1 });

  /**
   * Visible courses are the ones not hidden in preferences
   * and belonging to the study plan of the active career
   */
  const visibleCourseIds = useMemo(() => {
    if (!courses) return [];

    const courseIds = courses.filter(notNullish).map(c => c.id!);

    const hiddenCourseIds = Object.entries(coursesPreferences)
      .filter(([_, prefs]) => prefs.isHidden)
      .map(([id]) => Number(id));

    return courseIds.filter(id => id && !hiddenCourseIds.includes(id));
  }, [courses, coursesPreferences]);

  return useInfiniteQuery<Lecture[]>(
    prefixKey([LECTURES_QUERY_KEY]),
    async ({ pageParam: since = DateTime.now().startOf('week') }) => {
      const until = since.plus(oneWeek);

      return lectureClient
        .getLectures({
          fromDate: since.toJSDate(),
          toDate: until.toJSDate(),
          courseIds: visibleCourseIds,
        })
        .then(r => r.data);
    },
    {
      enabled: Array.isArray(visibleCourseIds),
      staleTime: Infinity, // TODO handle manual refetch of last page only
    },
  );
};
