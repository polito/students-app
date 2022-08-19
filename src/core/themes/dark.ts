import { Theme } from '../../../lib/ui/types/theme';
import { lightTheme } from './light';

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: '#00080D',
    surface: '#12171B',
    heading: lightTheme.colors.text[50],
    title: 'white',
    prose: lightTheme.colors.text[50],
    secondaryText: lightTheme.colors.text[400],
    caption: lightTheme.colors.text[500],
    link: lightTheme.colors.primary[400],
    divider: lightTheme.colors.muted[700],
    touchableHighlight: 'rgba(255, 255, 255, .08)',
  },
};
