import { Settings } from 'luxon';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import './i18n';

export const App = () => {
  Settings.defaultLocale = 'it-IT';

  return (
    <SplashProvider>
      <PreferencesProvider>
        <UiProvider>
          <ApiProvider>
            <AppContent />
          </ApiProvider>
        </UiProvider>
      </PreferencesProvider>
    </SplashProvider>
  );
};
