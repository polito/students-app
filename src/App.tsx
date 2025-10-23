import { SafeAreaProvider } from 'react-native-safe-area-context';

import Mapbox from '@rnmapbox/maps';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
import { FeedbackProvider } from './core/providers/FeedbackProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import { Sentry } from './utils/sentry';
import { extendSuperJSON } from './utils/superjson';

extendSuperJSON();

Mapbox.setAccessToken(process.env.MAPBOX_TOKEN!);

const App = () => {
  return (
    <SafeAreaProvider>
      <SplashProvider>
        <PreferencesProvider>
          <UiProvider>
            <FeedbackProvider>
              <ApiProvider>
                <DownloadsProvider>
                  <AppContent />
                </DownloadsProvider>
              </ApiProvider>
            </FeedbackProvider>
          </UiProvider>
        </PreferencesProvider>
      </SplashProvider>
    </SafeAreaProvider>
  );
};

export default Sentry.withTouchEventBoundary(App);
