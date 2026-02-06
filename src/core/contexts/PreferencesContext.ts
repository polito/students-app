import { createContext, useContext } from 'react';

import { PlaceOverview } from '@polito/api-client';
import { PersonOverview } from '@polito/api-client/models';

import { AgendaTypesFilterState } from '~/features/agenda/types/AgendaTypesFilterState.ts';
import {
  HiddenRecurrence,
  SingleEvent,
} from '~/features/courses/types/Recurrence.ts';

export const editablePreferenceKeys = [
  // This version is used exclusively for migrations.
  // For all other cases, use DeviceInfo from react-native-device-info.
  'accessibility',
  'lastInstalledVersion',
  'username',
  'campusId',
  'colorScheme',
  'showColorWarning',
  'courses',
  'language',
  'notifications',
  'favoriteServices',
  'peopleSearched',
  'onboardingStep',
  'emailGuideRead',
  'placesSearched',
  'agendaScreen',
  'filesScreen',
  'hideGrades',
  'loginUid',
  'politoAuthnEnrolmentStatus',
] as const;

export type PreferenceKey = (typeof editablePreferenceKeys)[number];

// Specify here complex keys, that require serialization/deserialization
export const objectPreferenceKeys = [
  'accessibility',
  'courses',
  'notifications',
  'favoriteServices',
  'peopleSearched',
  'onboardingStep',
  'emailGuideRead',
  'placesSearched',
  'agendaScreen',
  'filesScreen',
  'hideGrades',
  'politoAuthnEnrolmentStatus',
];

export type CoursesPreferences = {
  [courseId: number | string]: CoursePreferencesProps;
};

export interface PreferencesContextBase {
  lastInstalledVersion: string | null;
  username: string;
  campusId?: string;
  colorScheme: 'light' | 'dark' | 'system';
  courses: CoursesPreferences;
  language: 'it' | 'en';
  notifications?: {
    important: boolean;
    events: boolean;
    presence: boolean;
  };
  favoriteServices: string[];
  peopleSearched: PersonOverview[];
  onboardingStep?: number;
  emailGuideRead?: boolean;
  placesSearched: PlaceOverview[];
  agendaScreen: {
    layout: 'weekly' | 'daily';
    filters: AgendaTypesFilterState;
  };
  filesScreen: 'filesView' | 'directoryView';
  accessibility?: {
    fontFamily?:
      | 'default'
      | 'open-dyslexic'
      | 'dyslexie'
      | 'easy-reading'
      | 'sylexiad';
    fontPlacement?: 'none';
    highContrast?: boolean;
    grayscale?: boolean;
    lineHeight?: boolean;
    wordSpacing?: boolean;
    letterSpacing?: boolean;
    paragraphSpacing?: boolean;
    fontSize?: 100 | 125 | 150 | 175 | 200;
  };
  showColorWarning?: boolean;
  hideGrades?: boolean;
  loginUid?: string | null;
  politoAuthnEnrolmentStatus?: {
    inSettings?: boolean;
    insertedDeviceName?: string;
    hideInitialPrompt?: boolean;
    toothpicTempKeyID?: string;
  };
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
  isHiddenInAgenda: boolean;
  itemsToHideInAgenda?: HiddenRecurrence[];
  singleItemsToHideInAgenda?: SingleEvent[];
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
