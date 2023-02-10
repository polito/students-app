import { NativeModules, Platform } from 'react-native';

export function useDeviceLanguage() {
  const deviceLocale =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
      : NativeModules.I18nManager.localeIdentifier;

  const language = deviceLocale.startsWith('it') ? 'it' : 'en';
  return language;
}
