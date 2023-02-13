import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { Appearance } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from 'i18next';
import i18next from 'i18next';

import en from '../../../assets/translations/en.json';
import it from '../../../assets/translations/it.json';
import { language } from '../../i18n';
import {
  PreferencesContext,
  PreferencesContextProps,
  storageKeys,
  storageObjectKeys,
} from '../contexts/PreferencesContext';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';

const fallbackPreferencesContext: Record<'language' | 'colorScheme', string> = {
  language: 'it',
  colorScheme: Appearance.getColorScheme() || 'system',
};

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const deviceLanguage = useDeviceLanguage();
  const [preferencesContext, setPreferencesContext] =
    useState<PreferencesContextProps>({
      colorScheme: null,
      courses: {},
      types: {},
      language: null,
      updatePreference: () => {},
    });

  const preferencesInitialized = useRef<boolean>(false);
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
          [key]:
            value ||
            fallbackPreferencesContext[key as 'language' | 'colorScheme'],
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
        const lang = value === 'system' ? deviceLanguage : value ?? language;
        if (key === 'language') {
          i18n
            .use(initReactI18next)
            .init({
              compatibilityJSON: 'v3',
              lng: lang,
              fallbackLng: 'it',
              resources: {
                en: { translation: en },
                it: { translation: it },
              },
            })
            .then(() => {
              i18next
                .changeLanguage(lang)
                .then(() => console.debug('i18n initialized'));
            });
        }

        if (storageObjectKeys.includes(key)) {
          // @ts-expect-error temporary type fix // TODO
          preferences[key] = JSON.parse(value) ?? {};
        }
        else if (key in fallbackPreferencesContext) {
          // @ts-expect-error temporary type fix // TODO
          preferences[key] = value ?? fallbackPreferencesContext[key];
        } else {
          // @ts-expect-error temporary type fix // TODO
          preferences[key] = value;
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
