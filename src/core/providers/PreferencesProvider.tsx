import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PreferenceKey,
  PreferencesContext,
  PreferencesContextProps,
  editablePreferenceKeys,
} from '../contexts/PreferencesContext';

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const [preferencesContext, setPreferencesContext] =
    useState<PreferencesContextProps>({
      colorScheme: 'system',
      courses: {},
      favoriteServices: [],
      language: 'system',
      shouldReportErrors: true,
      updatePreference: () => {},
    });

  const preferencesInitialized = useRef<boolean>(false);

  const updatePreference = (key: PreferenceKey, value: unknown) => {
    const stringKey = key.toString();
    if (value === null) {
      AsyncStorage.removeItem(stringKey).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [stringKey]: value,
        })),
      );
    } else {
      AsyncStorage.setItem(stringKey, JSON.stringify(value)).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [stringKey]: value,
        })),
      );
    }
  };

  // Initialize preferences from AsyncStorage
  useEffect(() => {
    AsyncStorage.multiGet(editablePreferenceKeys).then(storagePreferences => {
      setPreferencesContext(oldP => ({
        ...oldP,
        ...Object.fromEntries(
          storagePreferences
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => {
              try {
                return [key, JSON.parse(value!)];
              } catch (e) {
                return [key, value];
              }
            }),
        ),
        updatePreference,
      }));
    });
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
