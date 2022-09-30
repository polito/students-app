import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';

import { fromUiTheme } from '../../utils/navigation-theme';
import { NavigationContainer } from '../components/NavigationContainer';
import { darkTheme } from '../themes/dark';
import { lightTheme } from '../themes/light';

export const UiProvider = ({ children }) => {
  const [fontsLoaded] = useFonts({
    'Poppins-bold': require('../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-bold-italic': require('../../../assets/fonts/Poppins/Poppins-BoldItalic.ttf'),
    'Poppins-normal-italic': require('../../../assets/fonts/Poppins/Poppins-Italic.ttf'),
    'Poppins-normal': require('../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-semibold': require('../../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-semibold-italic': require('../../../assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf'),
  });

  const colorScheme = useColorScheme();
  const uiTheme = colorScheme === 'light' ? lightTheme : darkTheme;
  const navigationTheme = useMemo(() => fromUiTheme(uiTheme), [uiTheme]);

  return (
    fontsLoaded && (
      <ThemeContext.Provider value={uiTheme}>
        <ExpoStatusBar />
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme}>
            {children}
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeContext.Provider>
    )
  );
};
