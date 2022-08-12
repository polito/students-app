import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { registerRootComponent } from 'expo';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { FetchError } from '@polito-it/api-client/runtime';
import NetInfo from '@react-native-community/netinfo';
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import MatomoTracker, { MatomoProvider } from 'matomo-tracker-react-native';
import { NavigationContainer } from './core/components/NavigationContainer';
import { RootNavigator } from './core/components/RootNavigator';
import { colors } from './core/constants/colors';
import * as themes from './core/constants/themes';
import './i18n';

export const App = () => {
  const colorScheme = useColorScheme();
  let theme, statusBarProps;

  if (colorScheme === 'dark') {
    theme = themes.DarkTheme;
    statusBarProps = {
      style: 'light',
      backgroundColor: colors.surfaceDark,
    };
  } else {
    theme = themes.LightTheme;
    statusBarProps = {
      style: 'dark',
      backgroundColor: colors.surfaceLight,
    };
  }

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
    // disabled: !isEnvProduction, // optional, default value: false. Disables all tracking operations if set to true.
    log: true, // optional, default value: false. Enables some logs if set to true.
  });

  return (
    <>
      <MatomoProvider instance={trackerInstance}>
        <QueryClientProvider client={queryClient}>
          <ExpoStatusBar {...statusBarProps} />
          <SafeAreaView style={styles.container}>
            <NavigationContainer theme={theme}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaView>
        </QueryClientProvider>
      </MatomoProvider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;
registerRootComponent(App);
