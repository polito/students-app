import { SafeAreaProviderCompat } from '@react-navigation/elements';
import Mapbox from '@rnmapbox/maps';

import { AppContent } from './core/components/AppContent';
import { DialogProvider } from './core/components/Dialog';
import { ApiProvider } from './core/providers/ApiProvider';
import { FeedbackProvider } from './core/providers/FeedbackProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import { Sentry } from './utils/sentry';
import { extendSuperJSON } from './utils/superjson';

extendSuperJSON();

Mapbox.setAccessToken(process.env.MAPBOX_TOKEN || 'no_token');

const App = () => {
  return (
    <SafeAreaProviderCompat>
      <SplashProvider>
        <PreferencesProvider>
          <UiProvider>
            <FeedbackProvider>
              <ApiProvider>
                <DialogProvider />
                <AppContent />
              </ApiProvider>
            </FeedbackProvider>
          </UiProvider>
        </PreferencesProvider>
      </SplashProvider>
    </SafeAreaProviderCompat>
  );
};

export default Sentry.withTouchEventBoundary(App);
