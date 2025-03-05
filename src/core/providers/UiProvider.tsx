import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { Linking, Platform, StatusBar, useColorScheme } from 'react-native';
import overrideColorScheme from 'react-native-override-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { LinkingOptions } from '@react-navigation/native';

import i18n from 'i18next';
import { Settings } from 'luxon';

import en from '../../../assets/translations/en.json';
import it from '../../../assets/translations/it.json';
import { fromUiTheme } from '../../utils/navigation-theme';
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

export const UiProvider = ({ children }: PropsWithChildren) => {
  const { colorScheme, language } = usePreferencesContext();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useColorScheme();
  const { isAppLoaded } = useSplashContext();
  const [, setParams] = useState({
    bl_id: '',
    fl_id: '',
    rm_id: '',
    placeId: '',
  });
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
  const linking: LinkingOptions<any> = {
    prefixes: ['polito://students'],
    config: {
      screens: {
        PlacesTab: {
          screens: {
            Place: {
              path: 'PlacesTab/Place/:placeId',

              // https://www.polito.it/mappe?bl_id=TO_CEN03&fl_id=XS01&rm_id=L003
              parse: {
                bl_id: (bl_id: string) => {
                  setParams(prevState => {
                    prevState.bl_id = bl_id;
                    return prevState;
                  });
                  return `${bl_id}`;
                },
                fl_id: (fl_id: string) => {
                  setParams(prevState => {
                    prevState.fl_id = fl_id;
                    return prevState;
                  });
                  return `${fl_id}`;
                },
                rm_id: (rm_id: string) => {
                  setParams(prevState => {
                    prevState.rm_id = rm_id;
                    return prevState;
                  });
                  return `${rm_id}`;
                },
                placeId: (placeId: string) => {
                  setParams(prevState => {
                    prevState.placeId = placeId;
                    return prevState;
                  });
                  return `${placeId}`;
                },
              },
            },
          },
        },
      },
    },
  };
  useEffect(() => {
    i18n.changeLanguage(language);
    Settings.defaultLocale = language;
  }, [language]);

  useEffect(() => {
    // Ottieni l'URL iniziale e naviga a `PlacesTab` con i parametri
    const GoToUrlOnMap = () => {
      Linking.getInitialURL().then(url => {
        if (url) {
          const route = url
            .replace('polito://students/PlacesTab/', '')
            .split('/');
          if (route.length === 2) {
            const placeId = `${route[1]}`;
            const newUrl = `polito://students/PlacesTab/Place/${placeId}`;
            if (isAppLoaded) {
              Linking.openURL(newUrl);
              // TO_CEN05&fl_id=XPTE&rm_id=B056
            }
          }
        }
      });
    };
    GoToUrlOnMap();
  }, [isAppLoaded]);
  return (
    <ThemeContext.Provider value={uiTheme}>
      <StatusBar
        backgroundColor={Platform.select({
          android: uiTheme.palettes.primary[700],
        })}
        barStyle={Platform.select({
          android: 'light-content',
          ios: theme === 'dark' ? 'light-content' : 'dark-content',
        })}
      />
      <NavigationContainer linking={linking} theme={navigationTheme}>
        {children}
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};
