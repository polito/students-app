import { PropsWithChildren, useMemo } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';

import { fromUiTheme } from '../../utils/navigation-theme';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { darkTheme } from '../themes/dark';
import { lightTheme } from '../themes/light';

export const UiProvider = ({ children }: PropsWithChildren) => {
  let { colorScheme } = usePreferencesContext();
  if (!colorScheme) {
    colorScheme = useColorScheme();
  }

  const uiTheme = colorScheme === 'light' ? lightTheme : darkTheme;
  const navigationTheme = useMemo(() => fromUiTheme(uiTheme), [uiTheme]);

  return (
    <ThemeContext.Provider value={uiTheme}>
      <StatusBar />
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          {children}
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
};
