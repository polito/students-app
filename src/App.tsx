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
import { NavigationContainer } from '@react-navigation/native';
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
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

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ExpoStatusBar {...statusBarProps} />
        <SafeAreaView style={styles.container}>
          <NavigationContainer theme={theme}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </QueryClientProvider>
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
