import { SafeAreaProvider } from 'react-native-safe-area-context';

import Mapbox from '@rnmapbox/maps';

import { PostHogProvider } from 'posthog-react-native';

import { AppContent } from './core/components/AppContent';
import { DialogProvider } from './core/components/Dialog';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
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
    <PostHogProvider
      apiKey={process.env.POSTHOG_API_KEY!}
      options={{
        host: process.env.POSTHOG_HOST!,
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllImages: false,
          maskAllTextInputs: false,
        },
      }}
    >
      <SafeAreaProvider>
        <SplashProvider>
          <PreferencesProvider>
            <UiProvider>
              <FeedbackProvider>
                <ApiProvider>
                  <DownloadsProvider>
                    <DialogProvider />
                    <AppContent />
                  </DownloadsProvider>
                </ApiProvider>
              </FeedbackProvider>
            </UiProvider>
          </PreferencesProvider>
        </SplashProvider>
      </SafeAreaProvider>
    </PostHogProvider>
  );
};

export default Sentry.withTouchEventBoundary(App);
