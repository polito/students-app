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
    // Check if this is a module (format: shortcode + index)
    let course = courses.find(
      c => c.id?.toString() === courseId || c.shortcode === courseId,
    );

    // If not found as course, check if it's a module
    if (!course) {
      // Try to find a course whose shortcode is a prefix of the courseId
      course = courses.find(c => {
        if (!c.shortcode) return false;
        return (
          courseId.startsWith(c.shortcode) &&
          courseId.length > c.shortcode.length
        );
      });

      if (course) {
        // This is a module, keep the original courseId as the key
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

    newPreferences[course.shortcode] = coursePrefs;
  });

  updatePreference('courses', newPreferences);
};
