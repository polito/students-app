import { OfferingCourseOverview, Track } from '@polito/api-client';

import { groupBy, map } from 'lodash';

export const getShortYear = (year: number): string => {
  return year.toString().substring(2, 4);
};

export const getTracksCoursesSections = (tracks?: Track[]) => {
  return (tracks || []).map((track, index) => {
    return {
      data: map(groupBy(track.courses, 'teachingYear'), (value, key) => {
        return {
          teachingYear: Number(key),
          data: value,
        };
      }),
      title: track.name,
      index,
      isExpanded: false,
    };
  });
};

export const getTracksCoursesGrouped = (courses: OfferingCourseOverview[]) => {
  return map(
    groupBy(
      courses.filter(c => c.group),
      'group',
    ),
    (value, key) => ({ name: key, data: value }),
  );
};

export const getTracksCoursesWithoutGroup = (
  courses: OfferingCourseOverview[],
) => {
  return courses.filter(c => !c.group);
};
