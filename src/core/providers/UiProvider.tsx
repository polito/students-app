import { PropsWithChildren, useEffect, useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';

import i18n from 'i18next';
import { Settings } from 'luxon';

import en from '../../../assets/translations/en.json';
import it from '../../../assets/translations/it.json';
import { deviceLanguage } from '../../utils/device';
import { fromUiTheme } from '../../utils/navigation-theme';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { darkTheme } from '../themes/dark';
import { lightTheme } from '../themes/light';

export const UiProvider = ({ children }: PropsWithChildren) => {
  let { colorScheme, language } = usePreferencesContext();
  const systemColorScheme = useColorScheme();

  if (colorScheme === 'system') {
    colorScheme = systemColorScheme ?? 'light';
  }

  if (language === 'system') {
    language = deviceLanguage;
  }

  const uiTheme = colorScheme === 'light' ? lightTheme : darkTheme;
  const navigationTheme = useMemo(() => fromUiTheme(uiTheme), [uiTheme]);

  useEffect(() => {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      lng: language,
      fallbackLng: 'en',
      resources: {
        en: {
          translation: en,
        },
        it: {
          translation: it,
        },
      },
    });

    Settings.defaultLocale = language;
  }, [language]);

  return (
    <ThemeContext.Provider value={uiTheme}>
      <StatusBar
        backgroundColor={Platform.select({
          android: uiTheme.palettes.primary[700],
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
