import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { DownloadsProvider } from './core/providers/DownloadsProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { SplashProvider } from './core/providers/SplashProvider';
import { UiProvider } from './core/providers/UiProvider';

export const App = () => {
  return (
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
  );
};
