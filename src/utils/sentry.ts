import { APP_VERSION, BUILD_NO } from '@env';
import * as S from '@sentry/react-native';

import { isEnvProduction } from './env';

export const navigationIntegration = S.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

S.init({
  dsn: 'https://0b3fe6c2fc0bd91481a14b1ad5c6b00d@sentry.k8s.polito.it/3',
  enabled: isEnvProduction,
  enableNative: true,
  integrations: [navigationIntegration],
  release: `it.polito.students@${APP_VERSION}`,
  dist: BUILD_NO,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const Sentry = S;
