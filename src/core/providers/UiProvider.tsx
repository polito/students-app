import { PropsWithChildren, useEffect, useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import overrideColorScheme from 'react-native-override-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';

import i18n from 'i18next';
import { Settings } from 'luxon';

import en from '../../../assets/translations/en.json';
import it from '../../../assets/translations/it.json';
import { fromUiTheme } from '../../utils/navigation-theme';
import { NavigationContainer } from '../components/NavigationContainer';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { darkTheme } from '../themes/dark';
import { lightTheme } from '../themes/light';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
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

export const UiProvider = ({ children }: PropsWithChildren) => {
  // eslint-disable-next-line prefer-const
  let { colorScheme, language } = usePreferencesContext();
  const systemColorScheme = useColorScheme();
  const safeAreaInsets = useSafeAreaInsets();

  if (colorScheme === 'system') {
    colorScheme = systemColorScheme ?? 'light';
  } else if (colorScheme !== systemColorScheme) {
    overrideColorScheme.setScheme(colorScheme);
  }

  const uiTheme = useMemo(
    () => ({
      ...(colorScheme === 'light' ? lightTheme : darkTheme),
      safeAreaInsets,
    }),
    [colorScheme, safeAreaInsets],
  );
  const navigationTheme = useMemo(() => fromUiTheme(uiTheme), [uiTheme]);

  useEffect(() => {
    i18n.changeLanguage(language);
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
      <NavigationContainer theme={navigationTheme}>
        {children}
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};
