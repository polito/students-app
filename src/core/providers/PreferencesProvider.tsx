import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PreferenceKey,
  PreferencesContext,
  PreferencesContextProps,
  editablePreferenceKeys,
  objectPreferenceKeys,
} from '../contexts/PreferencesContext';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const deviceLanguage = useDeviceLanguage();
  const [preferencesContext, setPreferencesContext] =
    useState<PreferencesContextProps>({
      lastInstalledVersion: null,
      username: '',
      colorScheme: 'system',
      courses: {},
      language: deviceLanguage,
      updatePreference: () => {},
      favoriteServices: [],
      peopleSearched: [],
      placesSearched: [],
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
      let storageValue: string;

      if (objectPreferenceKeys.includes(key)) {
        storageValue = JSON.stringify(value);
      } else {
        storageValue = value as string;
      }

      AsyncStorage.setItem(stringKey, storageValue).then(() =>
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
      const preferences: Partial<PreferencesContextProps> = {
        updatePreference,
      };
      storagePreferences.map(([key, value]) => {
        if (value === null) return;

        const typedKey = key as PreferenceKey;

        if (objectPreferenceKeys.includes(key)) {
          preferences[typedKey] = JSON.parse(value) ?? {};
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
