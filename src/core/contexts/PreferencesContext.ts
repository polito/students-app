import { createContext, useContext } from 'react';

export interface PreferencesContextProps {
  clientId?: string;
  colorScheme?: 'light' | 'dark' | 'system';
  courses: {
    [courseId: number]: CoursePreferencesProps;
  };
  types: {
    [key: string]: TypesPreferencesProps;
  };
  language?: 'it' | 'en' | 'system';
  notifications?: {
    important: boolean;
    events: boolean;
    presence: boolean;
  };
  updatePreference: <K extends keyof PreferencesContextProps>(
    key: K,
    value: PreferencesContextProps[K],
  ) => void;
}

export interface CoursePreferencesProps {
  color: string;
  icon: string;
  isHidden: boolean;
  order?: number;
}

export interface TypesPreferencesProps {
  color: string;
}

export const storageKeys = [
  'clientId',
  'colorScheme',
  'courses',
  'language',
  'types',
  'notifications',
];

// Require serialization/deserialization
export const storageObjectKeys = ['courses', 'types', 'notifications'];
export const storageStringKeys = ['colorScheme', 'language'];

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
