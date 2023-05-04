import * as Sentry from '@sentry/react-native';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';

Sentry.init({
  dsn: 'https://6b860b219cbe49daa89a10a5d20f4d79@sentry.k8s.polito.it/2',
});

export const App = () => {
  return (
    <SplashProvider>
      <PreferencesProvider>
        <UiProvider>
          <ApiProvider>
            <DownloadsProvider>
              <AppContent />
            </DownloadsProvider>
          </ApiProvider>
        </UiProvider>
      </PreferencesProvider>
    </SplashProvider>
  );
};
