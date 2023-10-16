import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';

import * as Sentry from '@sentry/react-native';

import { name as appName } from './app.json';
import { App } from './src/App';

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));
