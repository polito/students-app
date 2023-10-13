import { createContext, useContext } from 'react';

import { PersonOverview } from '@polito/api-client/models';

export const editablePreferenceKeys = [
  'clientId',
  'colorScheme',
  'courses',
  'language',
  'notifications',
  'favoriteServices',
  'peopleSearched',
  'unreadNotifications',
] as const;

export type PreferenceKey = typeof editablePreferenceKeys[number];

// Specify here complex keys, that require serialization/deserialization
export const objectPreferenceKeys = [
  'courses',
  'notifications',
  'favoriteServices',
  'peopleSearched',
  'unreadNotifications',
];

export type CoursesPreferences = {
  [courseId: number]: CoursePreferencesProps;
};

export type PreferencesContextProps = {
  clientId?: string;
  colorScheme: 'light' | 'dark' | 'system';
  courses: CoursesPreferences;
  language: 'it' | 'en';
  notifications?: {
    important: boolean;
    events: boolean;
    presence: boolean;
  };
  updatePreference: (key: PreferenceKey, value: unknown) => void;
  favoriteServices: string[];
  peopleSearched: PersonOverview[];
  /**
   * A map from notification object path to number of unread notifications
   *
   * @example
   * {
   *   "courses/12345/notices/12345": 1,
   *   "tickets/12345": 2,
   * }
   */
  unreadNotifications: Record<string, number>;
};

export interface CoursePreferencesProps {
  color: string;
  icon?: string;
  isHidden: boolean;
  order?: number;
}

export const PreferencesContext = createContext<
  PreferencesContextProps | undefined
>(undefined);

export const usePreferencesContext = () => {
  const preferencesContext = useContext(PreferencesContext);
  if (!preferencesContext)
    throw new Error(
      'No PreferencesContext.Provider found when calling usePreferencesContext.',
    );
  return preferencesContext;
};
