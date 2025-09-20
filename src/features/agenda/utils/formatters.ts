import { DateTime, IANAZone } from 'luxon';
import { CoursesPreferences } from 'src/core/contexts/PreferencesContext';

import { courseColors } from '../../../core/constants';
import { dateFormatter } from '../../../utils/dates';
import { LectureItem } from '../types/AgendaItem';
import { Lecture } from '../types/Lecture';

export const formatNextLecture = (
  lecture: Lecture,
  coursesPreferences: CoursesPreferences,
): LectureItem => {
  const formatTime = dateFormatter('HH:mm');
  const lectureStart = DateTime.fromJSDate(lecture.startsAt, {
    zone: IANAZone.create('Europe/Rome'),
  });

  return {
    title: lecture.courseName,
    key: `${lecture.id}`,
    startTimestamp: lecture.startsAt.getTime(),
    date: lecture.startsAt.toISOString(),
    start: lectureStart,
    end: DateTime.fromJSDate(lecture.endsAt, {
      zone: IANAZone.create('Europe/Rome'),
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
    color:
      coursesPreferences[lecture.uniqueShortcode ?? '']?.color ??
      courseColors[0].color,
    icon: coursesPreferences[lecture.uniqueShortcode ?? '']?.icon,
    uniqueShortcode: lecture.uniqueShortcode ?? '',
  };
};
