import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';

import * as Sentry from '@sentry/react-native';

import { name as appName } from './app.json';
import { App } from './src/App';

import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-datetimeformat/polyfill';
import '@formatjs/intl-datetimeformat/locale-data/it';
import '@formatjs/intl-datetimeformat/locale-data/en';
import '@formatjs/intl-datetimeformat/add-golden-tz'

if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    Intl.DateTimeFormat.__setDefaultTimeZone('Europe/Rome')
}

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));