import { getLocales } from 'react-native-localize';

export function useDeviceLanguage() {
  const deviceLocale = getLocales()[0];
  return deviceLocale && deviceLocale.languageCode === 'it' ? 'it' : 'en';
}
