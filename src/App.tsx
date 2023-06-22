import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as Sentry from '@sentry/react-native';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import { initSentry } from './utils/sentry';

initSentry();

export const App = () => {
  return (
    <Sentry.TouchEventBoundary>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </Sentry.TouchEventBoundary>
  );
};
