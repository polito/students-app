import { createContext, useContext } from 'react';

import { PlaceOverview } from '@polito/api-client';
import { PersonOverview } from '@polito/api-client/models';

import { AgendaTypesFilterState } from '../../features/agenda/types/AgendaTypesFilterState';
import { UnreadNotifications } from '../types/notifications';

export const editablePreferenceKeys = [
  'accessibility',
  'agendaScreen',
  'campusId',
  'colorScheme',
  'courses',
  'emailGuideRead',
  'favoriteServices',
  'language',
  'lastInstalledVersion',
  'notifications',
  'onboardingStep',
  'peopleSearched',
  'placesSearched',
  'unreadNotifications',
  'username',
] as const;

export type PreferenceKey = typeof editablePreferenceKeys[number];

// Specify here complex keys, that require serialization/deserialization
export const objectPreferenceKeys = [
  'accessibility',
  'agendaScreen',
  'courses',
  'emailGuideRead',
  'favoriteServices',
  'notifications',
  'onboardingStep',
  'peopleSearched',
  'placesSearched',
  'unreadNotifications',
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
  agendaScreen: {
    layout: 'weekly' | 'daily';
    filters: AgendaTypesFilterState;
  };
  accessibility?: {
    fontFamily?: 'default' | 'open-dyslexic';
    fontPlacement?: 'default' | 'bottom';
    highContrast?: boolean;
    grayscale?: boolean;
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
