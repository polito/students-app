import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
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
    <UiProvider>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </UiProvider>
    /* </MatomoProvider> */
  );
};

export default App;
registerRootComponent(App);
