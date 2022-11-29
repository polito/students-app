import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

import { Theme as UiTheme } from '../../lib/ui/types/theme';
import { lightTheme } from '../core/themes/light';

export const fromUiTheme = (uiTheme: UiTheme): Theme => {
  const baseTheme = uiTheme.dark ? DarkTheme : DefaultTheme;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: uiTheme.colors.primary[uiTheme.dark ? 400 : 500],
      background: uiTheme.colors.background,
      card: uiTheme.colors.surface,
      text: uiTheme.dark ? 'white' : lightTheme.colors.text[800],
      notification: uiTheme.colors.danger[uiTheme.dark ? 400 : 500],
      border: uiTheme.colors.divider,
    },
  };
};
