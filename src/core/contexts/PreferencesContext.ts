import { createContext, useContext } from 'react';

import { PersonOverview } from '@polito/api-client/models';

import { UnreadNotifications } from '../types/notifications';

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
   * A map whose keys represent a path to an object or area where the update
   * occurred and leaf values are the number of unread updates
   *
   * @example
   * {
   *   "teaching": { "courses": { "12345": { "notices": { "12345": 1 } } } },
   *   "services": { "tickets": { "12345": 2 } },
   * }
   */
  unreadNotifications: UnreadNotifications;
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
