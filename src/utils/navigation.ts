import { Platform } from 'react-native';

import { titlesStyles } from '@core/hooks/titlesStyles';

import { Theme } from '@lib/ui/types/Theme';

export const getDefaultScreenOptions = (theme: Theme) => ({
  headerLargeTitle: true,
  headerTransparent: Platform.select({ ios: true }),
  headerLargeStyle: {
    backgroundColor: theme.colors.background,
  },
  ...titlesStyles(theme),
});
