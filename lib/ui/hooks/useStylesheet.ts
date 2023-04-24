import { useMemo } from 'react';

import { Theme } from '../types/Theme';
import { useTheme } from './useTheme';

export const useStylesheet = <T>(stylesheetCreator: (theme: Theme) => T) => {
  const theme = useTheme();
  return useMemo(() => stylesheetCreator(theme), [stylesheetCreator, theme]);
};
