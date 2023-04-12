import { Theme as UiTheme } from '@lib/ui/types/Theme';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

import { lightTheme } from '../core/themes/light';

export const fromUiTheme = (uiTheme: UiTheme): Theme => {
  const baseTheme = uiTheme.dark ? DarkTheme : DefaultTheme;
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: uiTheme.palettes.primary[uiTheme.dark ? 400 : 500],
      background: uiTheme.colors.background,
      card: uiTheme.colors.surface,
      text: uiTheme.dark ? 'white' : lightTheme.palettes.text[800],
      notification: uiTheme.palettes.danger[uiTheme.dark ? 400 : 500],
    },
  };
};
