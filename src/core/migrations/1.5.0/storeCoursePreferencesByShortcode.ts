import { CoursesApi } from '@polito/api-client';

import { pluckData } from '../../../utils/queries';
import {
  CoursesPreferences,
  PreferencesContextProps,
} from '../../contexts/PreferencesContext';

export const storeCoursePreferencesByShortcode = async (
  preferences: PreferencesContextProps,
) => {
  const { courses: coursesPreferences, updatePreference } = preferences;

  const courses = await new CoursesApi()
    .getCourses()
    .then(pluckData)
    .catch(() => []);

  const preferencesEntries = Object.entries(coursesPreferences);

  if (preferencesEntries.length === 0) {
    return;
  }

  const newPreferences: CoursesPreferences = {};
  preferencesEntries.forEach(([courseId, coursePrefs]) => {
    let course = courses.find(
      c => c.id?.toString() === courseId || c.shortcode === courseId,
    );

    if (!course) {
      course = courses.find(c => {
        if (!c.shortcode) return false;
        return (
          courseId.startsWith(c.shortcode) &&
          courseId.length > c.shortcode.length
        );
      });

      if (course) {
        if (course.modules && course.modules.length > 0) {
          const moduleIndex = course.modules.findIndex(
            (_, index) => courseId === `${course!.shortcode}${index + 1}`,
          );
          if (moduleIndex >= 0) {
            newPreferences[courseId] = coursePrefs;
            return;
          }
        }
        newPreferences[courseId] = coursePrefs;
        return;
      }
    }

    if (!course) {
      console.warn(
        'Could not find matching course for preferences with id',
        courseId,
      );
      return;
    }

    if (course.modules && course.modules.length > 0) {
      const moduleIndex = course.modules.findIndex(
        (_, index) => courseId === `${course?.shortcode}${index + 1}`,
      );
      if (moduleIndex >= 0) {
        newPreferences[courseId] = coursePrefs;
        return;
      }
    }

    if (courseId === course.shortcode) {
      newPreferences[course.shortcode] = coursePrefs;
    } else {
      newPreferences[courseId] = coursePrefs;
    }
  });

  updatePreference('courses', newPreferences);
};
