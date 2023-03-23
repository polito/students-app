import { createContext, useContext } from 'react';

export const editablePreferenceKeys = [
  'clientId',
  'colorScheme',
  'courses',
  'favoriteServices',
  'language',
  'notifications',
  'shouldReportErrors',
] as const;

export type PreferenceKey = (typeof editablePreferenceKeys)[number];

export type CoursesPreferences = {
  [courseId: number]: CoursePreferencesProps;
};

export type PreferencesContextProps = {
  clientId?: string;
  colorScheme: 'light' | 'dark' | 'system';
  courses: CoursesPreferences;
  favoriteServices: string[];
  language: 'it' | 'en' | 'system';
  notifications?: {
    important: boolean;
    events: boolean;
    presence: boolean;
  };
  shouldReportErrors: boolean;
  updatePreference: (key: PreferenceKey, value: unknown) => void;
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
