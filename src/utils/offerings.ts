import { Track } from '@polito/api-client';

import { groupBy, map } from 'lodash';

export const getShortYear = (year: number): string => {
  return year.toString().substring(2, 4);
};

export const getTracksCoursesGrouped = (tracks?: Track[]) => {
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
