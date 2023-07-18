import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Mapbox from '@rnmapbox/maps';
import * as Sentry from '@sentry/react-native';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import { GlobalStyles } from './core/styles/GlobalStyles';
import { initSentry } from './utils/sentry';

initSentry();

Mapbox.setAccessToken(process.env.MAPBOX_TOKEN!);

export const App = () => {
  return (
    <Sentry.TouchEventBoundary>
      <GestureHandlerRootView style={GlobalStyles.grow}>
        <SafeAreaProvider>
          <SplashProvider>
            <PreferencesProvider>
              <UiProvider>
                <ApiProvider>
                  <DownloadsProvider>
                    <BottomSheetModalProvider>
                      <AppContent />
                    </BottomSheetModalProvider>
                  </DownloadsProvider>
                </ApiProvider>
              </UiProvider>
            </PreferencesProvider>
          </SplashProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Sentry.TouchEventBoundary>
  );
};
