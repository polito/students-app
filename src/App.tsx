import { Settings } from 'luxon';

import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';
import { language } from './i18n';
import './i18n';

export const App = () => {
  Settings.defaultLocale = language;

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
