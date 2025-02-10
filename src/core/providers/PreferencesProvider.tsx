import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EditablePreferences,
  PreferenceKey,
  PreferencesContext,
  PreferencesContextProps,
  UpdatePreferenceValue,
  editablePreferenceKeys,
  objectPreferenceKeys,
} from '../contexts/PreferencesContext';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const deviceLanguage = useDeviceLanguage();
  const [preferencesContext, setPreferencesContext] =
    useState<PreferencesContextProps>({
      lastInstalledVersion: undefined,
      username: '',
      colorScheme: 'system',
      courses: {},
      language: deviceLanguage,
      updatePreference: () => {},
      favoriteServices: [],
      peopleSearched: [],
      placesSearched: [],
      agendaScreen: {
        layout: 'daily',
        filters: {
          booking: false,
          deadline: false,
          exam: false,
          lecture: false,
        },
      },
      filesScreen: 'filesView',
    });

  const preferencesInitialized = useRef<boolean>(false);

  // Initialize preferences from AsyncStorage
  useEffect(() => {
    const updatePreference = <K extends PreferenceKey>(
      key: K,
      value: UpdatePreferenceValue<K>,
    ) => {
      const stringKey = key.toString();

      // if value is undefined, remove the preference
      if (value === undefined) {
        AsyncStorage.removeItem(stringKey).then(() =>
          setPreferencesContext(oldP => ({
            ...oldP,
            [stringKey]: value,
          })),
        );

        return;
      }

      let storageValue: string;
      let nextValue: EditablePreferences[PreferenceKey];

      // if value is a callback, call it with the current value
      if (typeof value === 'function') {
        const currentValue = preferencesContext[key];
        nextValue = value(currentValue);
      } else {
        nextValue = value;
      }

      // if value is an object, stringify it
      if (objectPreferenceKeys.includes(key)) {
        storageValue = JSON.stringify(nextValue);
      } else {
        storageValue = nextValue as string;
      }

      AsyncStorage.setItem(stringKey, storageValue).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [stringKey]: nextValue,
        })),
      );
    };

    AsyncStorage.multiGet(editablePreferenceKeys).then(storagePreferences => {
      const preferences: Partial<PreferencesContextProps> = {
        updatePreference,
      };
      storagePreferences.map(([key, value]) => {
        if (value === null) return;

        const typedKey = key as PreferenceKey;

        if (objectPreferenceKeys.includes(key)) {
          (preferences[typedKey] as NonNullable<
            (typeof preferences)[typeof typedKey]
          >) = (JSON.parse(value) ?? {}) as NonNullable<
            PreferencesContextProps[PreferenceKey]
          >;
        } else {
          if (typedKey === 'language' && value === 'system') {
            preferences[typedKey] = deviceLanguage;
          }
          preferences[typedKey] = value as any;
        }
      });

      setPreferencesContext(oldP => {
        return { ...oldP, ...preferences };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  // Preferences are loaded
  useEffect(() => {
    preferencesInitialized.current = true;
  }, [preferencesContext]);

  return (
    <PreferencesContext.Provider value={preferencesContext}>
      {preferencesInitialized.current && children}
    </PreferencesContext.Provider>
  );
};
