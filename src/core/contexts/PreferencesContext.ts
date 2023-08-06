import { createContext, useContext } from 'react';

import { PersonOverview } from '@polito/api-client/models';

export const editablePreferenceKeys = [
  'clientId',
  'colorScheme',
  'courses',
  'language',
  'notifications',
  'favoriteServices',
] as const;

export type PreferenceKey = typeof editablePreferenceKeys[number];

// Specify here complex keys, that require serialization/deserialization
export const objectPreferenceKeys = [
  'courses',
  'notifications',
  'favoriteServices',
];

export type CoursesPreferences = {
  [courseId: number]: CoursePreferencesProps;
};

export type PeoplePreferences = {
  searchString: string;
  results: PersonOverview[];
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
  peopleSearches: PeoplePreferences;
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
