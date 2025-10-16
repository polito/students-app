import { PropsWithChildren, useEffect, useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { Linking, useColorScheme } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import overrideColorScheme from 'react-native-override-color-scheme';
import { PaperProvider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';

import { useMaterialTheme } from '~/core/hooks/useMaterialTheme.ts';
import { setDeepLink } from '~/utils/linking.ts';
import { fromUiTheme } from '~/utils/navigation-theme.ts';

import i18n from 'i18next';
import { Settings } from 'luxon';

import en from '../../../assets/translations/en.json';
import it from '../../../assets/translations/it.json';
import { NavigationContainer } from '../components/NavigationContainer';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';
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

const PaperProviderWrapper = ({ children }: PropsWithChildren) => {
  const materialTheme = useMaterialTheme();
  return <PaperProvider theme={materialTheme}>{children}</PaperProvider>;
};

export const UiProvider = ({ children }: PropsWithChildren) => {
  const { colorScheme, language } = usePreferencesContext();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useColorScheme();
  const { isAppLoaded } = useSplashContext();
  useEffect(() => {
    if (colorScheme === 'dark' || colorScheme === 'light') {
      overrideColorScheme.setScheme(colorScheme);
    } else {
      overrideColorScheme.setScheme();
    }
  }, [colorScheme]);

  const uiTheme = useMemo(() => {
    const effectiveTheme = colorScheme === 'system' ? theme : colorScheme;

    return {
      ...(effectiveTheme === 'light' ? lightTheme : darkTheme),
      safeAreaInsets,
    };
  }, [colorScheme, theme, safeAreaInsets]);

  const navigationTheme = useMemo(() => fromUiTheme(uiTheme), [uiTheme]);

  useEffect(() => {
    i18n.changeLanguage(language);
    Settings.defaultLocale = language;
  }, [language]);

  useEffect(() => {
    // Ottieni l'URL iniziale e naviga a `PlacesTab` con i parametri
    const GoToUrlOnMap = () => {
      Linking.getInitialURL().then(url => {
        if (url) {
          if (isAppLoaded) {
            Linking.openURL(url);
          }
        }
      });
    };
    GoToUrlOnMap();
  }, [isAppLoaded]);
  return (
    <ThemeContext.Provider value={uiTheme}>
      <SystemBars style="auto" />
      <NavigationContainer linking={setDeepLink()} theme={navigationTheme}>
        <PaperProviderWrapper>{children}</PaperProviderWrapper>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};
