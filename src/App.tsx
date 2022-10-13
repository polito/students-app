import { AppContent } from './core/components/AppContent';
import { ApiProvider } from './core/providers/ApiProvider';
import { PreferencesProvider } from './core/providers/PreferencesProvider';
import { UiProvider } from './core/providers/UiProvider';
import './i18n';

export const App = () => {
  return (
    <PreferencesProvider>
      <UiProvider>
        <ApiProvider>
          <AppContent />
        </ApiProvider>
      </UiProvider>
    </PreferencesProvider>
  );
};
