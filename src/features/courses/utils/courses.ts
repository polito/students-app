import { CourseOverview } from '../../../core/types/api';

export const isCourseDetailed = (course: CourseOverview) => {
  if (course.id !== null) return true;
  if (course.previousEditions.some(edition => edition.id !== null)) return true;
  return false;
};

export const getLatestCourseInfo = (course: CourseOverview) => {
  if (course.id !== null) {
    return {
      id: course.id,
      name: course.name,
      uniqueShortcode: course.uniqueShortcode,
    };
  }
  const latestEdition = course.previousEditions
    .filter(edition => edition.id !== null)
    .sort((a, b) => +b.year - +a.year)[0];
  if (latestEdition) {
    return {
      id: latestEdition.id,
      name: course.name,
      uniqueShortcode: course.uniqueShortcode,
    };
  }
  return null;
};
