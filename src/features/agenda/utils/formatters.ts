import { CoursesPreferences } from '~/core/contexts/PreferencesContext';
import { APP_TIMEZONE, dateFormatter } from '~/utils/dates';

import { DateTime } from 'luxon';

import { LectureItem } from '../types/AgendaItem';
import { Lecture } from '../types/Lecture';

export const formatNextLecture = (
  lecture: Lecture,
  coursesPreferences: CoursesPreferences,
): LectureItem => {
  const formatTime = dateFormatter('HH:mm');
  const lectureStart = DateTime.fromJSDate(lecture.startsAt, {
    zone: APP_TIMEZONE,
  });

  return {
    title: lecture.courseName,
    key: `${lecture.id}`,
    startTimestamp: lecture.startsAt.getTime(),
    date: lecture.startsAt.toISOString(),
    start: lectureStart,
    end: DateTime.fromJSDate(lecture.endsAt, {
      zone: APP_TIMEZONE,
    }),
    id: lecture.id,
    courseId: lecture.courseId,
    type: 'lecture',
    fromTime: formatTime(lecture.startsAt),
    toTime: formatTime(lecture.endsAt),
    description: lecture.description,
    teacherId: lecture.teacherId,
    place: lecture.place,
    virtualClassrooms: lecture.virtualClassrooms,
    color: coursesPreferences[lecture.uniqueShortcode ?? '']?.color,
    icon: coursesPreferences[lecture.uniqueShortcode ?? '']?.icon,
    uniqueShortcode: lecture.uniqueShortcode ?? '',
  };
};
