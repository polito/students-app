import DeviceInfo from 'react-native-device-info';

import * as Sentry from '@sentry/react-native';

export const routingInstrumentation =
  new Sentry.ReactNavigationInstrumentation();

export const initSentry = () => {
  Sentry.init({
    dsn: 'https://6b860b219cbe49daa89a10a5d20f4d79@sentry.k8s.polito.it/2',
    enabled: process.env.NODE_ENV === 'production',
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation,
      }),
    ],
    dist: DeviceInfo.getBuildNumber(),
    release: DeviceInfo.getVersion(),
    environment: process.env.NODE_ENV,
  });
};
