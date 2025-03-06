import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { resolvePlaceId } from '../../places/utils/resolvePlaceId';
import { AgendaItem } from '../types/AgendaItem';

export const useHideEventFilter = (data: AgendaItem[]) => {
  const { courses } = usePreferencesContext();

  return data.filter(item => {
    if (item.type !== 'lecture') return true;

    if (!item.uniqueShortcode) return true;

    const course = courses[item.uniqueShortcode];

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
};
