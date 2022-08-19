import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { FetchError } from '@polito-it/api-client/runtime';
import NetInfo from '@react-native-community/netinfo';
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import MatomoTracker, { MatomoProvider } from 'matomo-tracker-react-native';
import { ThemeContext } from '../lib/ui/contexts/ThemeContext';
import { NavigationContainer } from './core/components/NavigationContainer';
import { RootNavigator } from './core/components/RootNavigator';
import { darkTheme } from './core/themes/dark';
import { lightTheme } from './core/themes/light';
import './i18n';
import { fromUiTheme } from './utils/navigation-theme';

export const App = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-bold-italic': require('../assets/fonts/Poppins/Poppins-BoldItalic.ttf'),
    'Poppins-normal-italic': require('../assets/fonts/Poppins/Poppins-Italic.ttf'),
    'Poppins-normal': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-semibold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-semibold-italic': require('../assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf'),
  });
  const colorScheme = useColorScheme();
  const uiTheme = colorScheme === 'light' ? lightTheme : darkTheme;
  const navigationTheme = useMemo(() => fromUiTheme(uiTheme), [uiTheme]);

  const isEnvProduction = process.env.NODE_ENV === 'production';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: isEnvProduction,
        refetchOnWindowFocus: isEnvProduction,
        onError(error: FetchError) {
          // TODO notify query error
          if (!isEnvProduction) {
            console.error(error?.cause?.message ?? error.message);
          }
        },
      },
    },
  });

  onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
      // TODO notify online status change
      if (!isEnvProduction) {
        console.log(
          'You are now ' + (state.isConnected ? 'online' : 'offline'),
        );
      }
      setOnline(!!state.isConnected);
    });
  });

  const trackerInstance = new MatomoTracker({
    urlBase: 'https://ingestion.webanalytics.italia.it', // required
    siteId: 8693, // required, number matching your Matomo project
    // userId: 'UID76903202' // optional, default value: `undefined`.
    disabled: true, // optional, default value: false. Disables all tracking operations if set to true.
    log: true, // optional, default value: false. Enables some logs if set to true.
  });

  return fontsLoaded ? (
    <MatomoProvider instance={trackerInstance}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={uiTheme}>
          <ExpoStatusBar />
          <SafeAreaProvider>
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </MatomoProvider>
  ) : null;
};

export default App;
registerRootComponent(App);
