import { APP_BUILD, APP_VERSION } from '@env';
import * as Sentry from '@sentry/react-native';

import { isEnvProduction } from './env';

export const routingInstrumentation =
  new Sentry.ReactNavigationInstrumentation();

export const initSentry = () => {
  Sentry.init({
    dsn: 'https://0b3fe6c2fc0bd91481a14b1ad5c6b00d@sentry.k8s.polito.it/3',
    enabled: isEnvProduction,
    enableNative: true,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation,
      }),
    ],
    release: `it.polito.students@${APP_VERSION}`,
    dist: APP_BUILD,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};
