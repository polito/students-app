import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { UiProvider } from './core/providers/UiProvider';
import './i18n';

SplashScreen.preventAutoHideAsync();

export const App = () => {
  /*
  const trackerInstance = new MatomoTracker({
    urlBase: 'https://ingestion.webanalytics.italia.it',
    siteId: 8693,
  });
  */

  return (
    /* <MatomoProvider instance={trackerInstance}> */
    <PreferencesProvider>
      <UiProvider>
        <ApiProvider>
          <AppContent />
        </ApiProvider>
      </UiProvider>
    </PreferencesProvider>
    /* </MatomoProvider> */
  );
};

export default App;
registerRootComponent(App);
