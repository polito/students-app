import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeContext } from '../lib/ui/contexts/ThemeContext';
import { MainNavigator } from './core/components/MainNavigator';
import './core/services/i18n';
import { darkTheme } from './core/themes/dark';
import { lightTheme } from './core/themes/light';
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

  return fontsLoaded ? (
    <>
      <ExpoStatusBar />
      <ThemeContext.Provider value={uiTheme}>
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme}>
            <MainNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeContext.Provider>
    </>
  ) : null;
};

export default App;
registerRootComponent(App);
