import { useMemo } from 'react';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { resolvePlaceId } from '../../places/utils/resolvePlaceId';
import { AgendaItem } from '../types/AgendaItem';

export const useProcessedLectures = (data: AgendaItem[]) => {
  const { courses } = usePreferencesContext();
  return useMemo(() => {
    return data
      .map(item => {
        if (item.type === 'lecture' && item.uniqueShortcode) {
          return {
            ...item,
            icon: courses[item.uniqueShortcode].icon,
            color: courses[item.uniqueShortcode].color,
          };
        }
        return item;
      })
      .filter(item => {
        if (item.type !== 'lecture') return true;

        if (!item.uniqueShortcode) return true;

        const course = courses[item.uniqueShortcode];

        if (course.isHidden) return false;

        if (course.isHiddenInAgenda) return false;

        if (!course.itemsToHideInAgenda) return true;

        const lectureRecurrence = {
          day: item.start.weekday,
          start: item.fromTime,
          end: item.toTime,
          room: item.place ? resolvePlaceId(item.place) : '',
        };

        const isLectureHidden = course.itemsToHideInAgenda.some(
          hiddenRecurrence =>
            hiddenRecurrence.day === lectureRecurrence.day &&
            hiddenRecurrence.start === lectureRecurrence.start &&
            hiddenRecurrence.end === lectureRecurrence.end &&
            hiddenRecurrence.room === lectureRecurrence.room,
        );

        return !isLectureHidden;
      });
  }, [courses, data]);
};
