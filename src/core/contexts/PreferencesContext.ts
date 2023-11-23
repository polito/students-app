import { createContext, useContext } from 'react';

import { PlaceOverview } from '@polito/api-client';
import { PersonOverview } from '@polito/api-client/models';

import { AgendaTypesFilterState } from '../../features/agenda/types/AgendaTypesFilterState';
import { UnreadNotifications } from '../types/notifications';

export const editablePreferenceKeys = [
  'lastInstalledVersion',
  'username',
  'campusId',
  'colorScheme',
  'courses',
  'language',
  'notifications',
  'favoriteServices',
  'peopleSearched',
  'unreadNotifications',
  'onboardingStep',
  'emailGuideRead',
  'placesSearched',
  'agendaScreen',
] as const;

export type PreferenceKey = typeof editablePreferenceKeys[number];

// Specify here complex keys, that require serialization/deserialization
export const objectPreferenceKeys = [
  'courses',
  'notifications',
  'favoriteServices',
  'peopleSearched',
  'unreadNotifications',
  'onboardingStep',
  'emailGuideRead',
  'placesSearched',
  'agendaScreen',
];

export type CoursesPreferences = {
  [courseId: number | string]: CoursePreferencesProps;
};

export interface EditablePreferences {
  lastInstalledVersion?: string;
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
}

/**
 * A callback that receives the previous value of the preference and returns the next one
 */
type UpdatePreferenceCallback<
  K extends PreferenceKey,
  V extends EditablePreferences[K],
> = (prev: V | undefined) => V | undefined;

/**
 * The value of a preference can be:
 * - a value of the type of the preference
 * - a callback that receives the previous value of the preference and returns the next one
 */
export type UpdatePreferenceValue<K extends PreferenceKey> =
  | EditablePreferences[K]
  | UpdatePreferenceCallback<K, EditablePreferences[K]>;

export interface PreferencesContextProps extends EditablePreferences {
  updatePreference: <K extends PreferenceKey>(
    key: K,
    value: UpdatePreferenceValue<K>,
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
