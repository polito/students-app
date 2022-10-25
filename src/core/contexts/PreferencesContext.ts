import { createContext, useContext } from 'react';

export interface PreferencesContextProps {
  colorScheme?: 'light' | 'dark';
  courses: {
    [courseId: number]: CoursePreferencesProps;
  };
  types: {
    [key: string]: TypesPreferencesProps;
  };
  language?: 'it' | 'en';
  updatePreference: (key: string, value: any) => void;
}

export interface CoursePreferencesProps {
  color: string;
  icon: string;
  isHidden: boolean;
}

export interface TypesPreferencesProps {
  color: string;
}

export const storageKeys = ['colorScheme', 'courses', 'language', 'types'];

// Require serialization/deserialization
export const storageObjectKeys = ['courses', 'types'];

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
