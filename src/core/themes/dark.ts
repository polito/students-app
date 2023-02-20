import { Theme } from '@lib/ui/types/theme';

import { lightTheme } from './light';

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: lightTheme.colors.primary[700],
    surface: '#143959',
    headers: '#1e3444',
    heading: lightTheme.colors.text[50],
    title: 'white',
    headline: 'white',
    prose: lightTheme.colors.text[50],
    secondaryText: lightTheme.colors.text[400],
    caption: lightTheme.colors.text[500],
    link: lightTheme.colors.primary[400],
    divider: 'rgba(255, 255, 255, .15)',
    touchableHighlight: 'rgba(255, 255, 255, .08)',
    tabBar: lightTheme.colors.darkBlue[100],
  },
};
