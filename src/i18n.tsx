import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';

import i18n from 'i18next';

import en from '../assets/translations/en.json';
import it from '../assets/translations/it.json';

const deviceLocale =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier;

export const language = deviceLocale.startsWith('it') ? 'it' : 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: language,
  fallbackLng: 'it',
  resources: {
    en: {
      translation: en,
    },
    it: {
      translation: it,
    },
  },
});
