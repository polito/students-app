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
    const course = courses.find(
      c =>
        c.id?.toString() === courseId ||
        c.shortcode + c.moduleNumber === courseId,
    );

    if (!course) {
      console.warn(
        'Could not find matching course for preferences with id',
        courseId,
      );
      return;
    }

    newPreferences[course.shortcode + course.moduleNumber] = coursePrefs;
  });

  updatePreference('courses', newPreferences);
};
