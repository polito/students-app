import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Mapbox from '@rnmapbox/maps';

import 'intl';
import 'intl/locale-data/jsonp/en';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import { GlobalStyles } from './core/styles/globalStyles';

Mapbox.setAccessToken(process.env.MAPBOX_TOKEN!);

export const App = () => {
  return (
    <GestureHandlerRootView style={GlobalStyles.grow}>
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
    </GestureHandlerRootView>
  );
};
