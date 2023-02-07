import { PropsWithChildren, useMemo } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
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
      <StatusBar
        backgroundColor={Platform.select({
          android: uiTheme.colors.primary[700],
        })}
        barStyle={Platform.select({
          android: 'light-content',
          ios: colorScheme === 'dark' ? 'light-content' : 'dark-content',
        })}
      />
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          {children}
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
};
