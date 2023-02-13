import { NativeModules, Platform } from 'react-native';

const deviceLocale =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier;

export const deviceLanguage = deviceLocale.startsWith('it') ? 'it' : 'en';
