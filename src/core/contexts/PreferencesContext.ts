import { createContext, useContext } from 'react';

export const editablePreferenceKeys = [
  'clientId',
  'campusId',
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

export interface PreferencesContextBase {
  clientId?: string;
  campusId?: string;
  colorScheme: 'light' | 'dark' | 'system';
  courses: CoursesPreferences;
  language: 'it' | 'en' | 'system';
  notifications?: {
    important: boolean;
    events: boolean;
    presence: boolean;
  };
  favoriteServices: string[];
}

export interface PreferencesContextProps extends PreferencesContextBase {
  updatePreference: <T extends PreferenceKey>(
    key: T,
    value: PreferencesContextBase[T],
  ) => void;
}

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
