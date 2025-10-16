import { useMemo } from 'react';
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme,
  MD3Theme,
} from 'react-native-paper';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const useMaterialTheme = (): MD3Theme => {
  const uiTheme = useTheme();

  return useMemo(() => {
    const baseTheme = uiTheme.dark ? MD3DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      dark: uiTheme.dark,
      colors: {
        ...baseTheme.colors,
        // Primary colors
        primary: uiTheme.palettes.primary[500],
        primaryContainer: uiTheme.palettes.primary[700],
        onPrimary: uiTheme.colors.white,
        onPrimaryContainer: uiTheme.colors.white,

        // Secondary colors
        secondary: uiTheme.palettes.secondary[500],
        secondaryContainer: uiTheme.palettes.secondary[700],
        onSecondary: uiTheme.colors.white,
        onSecondaryContainer: uiTheme.colors.white,

        // Tertiary colors
        tertiary: uiTheme.palettes.tertiary[500],
        tertiaryContainer: uiTheme.palettes.tertiary[700],
        onTertiary: uiTheme.colors.white,
        onTertiaryContainer: uiTheme.colors.white,

        // Error colors
        error: uiTheme.palettes.error[500],
        errorContainer: uiTheme.palettes.error[700],
        onError: uiTheme.colors.white,
        onErrorContainer: uiTheme.colors.white,

        // Background and surface
        background: uiTheme.colors.background,
        onBackground: uiTheme.colors.prose,
        surface: uiTheme.colors.surface,
        onSurface: uiTheme.colors.title,
        surfaceVariant: uiTheme.dark
          ? uiTheme.palettes.gray[700]
          : uiTheme.palettes.gray[100],
        onSurfaceVariant: uiTheme.colors.secondaryText,
        surfaceDisabled: uiTheme.dark
          ? uiTheme.palettes.gray[800]
          : uiTheme.palettes.gray[200],
        onSurfaceDisabled: uiTheme.colors.disableTitle,

        // Outline
        outline: uiTheme.colors.divider,
        outlineVariant: uiTheme.palettes.gray[300],

        // Other colors
        shadow: uiTheme.colors.black,
        scrim: uiTheme.colors.black,
        inverseSurface: uiTheme.dark
          ? uiTheme.colors.white
          : uiTheme.colors.surfaceDark,
        inverseOnSurface: uiTheme.dark
          ? uiTheme.colors.surfaceDark
          : uiTheme.colors.white,
        inversePrimary: uiTheme.palettes.primary[300],
        backdrop: 'rgba(0, 0, 0, 0.4)',

        // Elevation
        elevation: {
          level0: 'transparent',
          level1: uiTheme.colors.surface,
          level2: uiTheme.colors.surface,
          level3: uiTheme.colors.surface,
          level4: uiTheme.colors.surface,
          level5: uiTheme.colors.surface,
        },
      },
    };
  }, [uiTheme]);
};
