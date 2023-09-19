import DeviceInfo from 'react-native-device-info';

import * as Sentry from '@sentry/react-native';

export const routingInstrumentation =
  new Sentry.ReactNavigationInstrumentation();

export const initSentry = () => {
  Sentry.init({
    dsn: 'https://0b3fe6c2fc0bd91481a14b1ad5c6b00d@sentry.k8s.polito.it/3',
    enabled: process.env.NODE_ENV === 'production',
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation,
      }),
    ],
    dist: DeviceInfo.getBuildNumber(),
    release: DeviceInfo.getVersion(),
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};
