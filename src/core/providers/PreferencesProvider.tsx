import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PreferencesContext,
  PreferencesContextProps,
  storageKeys,
  storageObjectKeys,
} from '../contexts/PreferencesContext';

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const [preferencesContext, setPreferencesContext] =
    useState<PreferencesContextProps>({
      colorScheme: null,
      courses: {},
      language: null,
      updatePreference: () => {},
    });

  const preferencesInitialized = useRef(false);

  const updatePreference = (key: string, value: any) => {
    if (!storageKeys.includes(key))
      throw new Error('You are trying to update an invalid preference');

    if (value === null) {
      AsyncStorage.removeItem(key).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [key]: value,
        })),
      );
    } else {
      const storedValue = storageObjectKeys.includes(key)
        ? JSON.stringify(value)
        : value;
      AsyncStorage.setItem(key, storedValue).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [key]: value,
        })),
      );
    }
  };

  // Initialize preferences from AsyncStorage
  useEffect(() => {
    AsyncStorage.multiGet(storageKeys).then(storagePreferences => {
      const preferences: Partial<PreferencesContextProps> = {
        updatePreference,
      };
      storagePreferences.map(([key, value]) => {
        // @ts-expect-error temporary type fix
        preferences[key] = storageObjectKeys.includes(key)
          ? JSON.parse(value) ?? {}
          : value;
      });

      setPreferencesContext(oldP => {
        return { ...oldP, ...preferences };
      });
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
