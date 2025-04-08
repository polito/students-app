import { getLocales } from 'react-native-localize';

const deviceLocale = getLocales()[0];

export const deviceLanguage =
  deviceLocale && deviceLocale.languageCode === 'it' ? 'it' : 'en';
