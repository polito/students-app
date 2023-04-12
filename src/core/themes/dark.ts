// noinspection AllyPlainJsInspection
//
import { Platform } from 'react-native';

import { Theme } from '@lib/ui/types/Theme';

import { lightTheme } from './light';

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: lightTheme.palettes.primary[700],
    surface: lightTheme.colors.surfaceDark,
    headersBackground: '#1e3444',
    heading: lightTheme.palettes.text[50],
    title: 'white',
    prose: lightTheme.palettes.text[50],
    secondaryText: lightTheme.palettes.text[400],
    caption: lightTheme.palettes.text[500],
    link: lightTheme.palettes.primary[400],
    translucentSurface: Platform.select({
      android: 'rgba(255, 255, 255, .1)',
      ios: 'rgba(0, 0, 0, .1)',
    })!,
    divider: 'rgba(255, 255, 255, .15)',
    touchableHighlight: 'rgba(255, 255, 255, .08)',
    agendaLecture: lightTheme.palettes.darkBlue[100],
  },
};
