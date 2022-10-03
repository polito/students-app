import { createContext, useContext } from 'react';

export interface PreferencesContextProps {
  colorScheme: 'light' | 'dark';
  courses: {
    [courseId: number]: CoursePreferencesProps;
  };
  language: 'it' | 'en';
  updatePreference: (key: string, value: any) => void;
}

export interface CoursePreferencesProps {
  color: string;
  icon: string;
  isHidden: boolean;
}

export const storageKeys = ['colorScheme', 'courses', 'language'];

// Require serialization/deserialization
export const storageObjectKeys = ['courses'];

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
