import { useMemo } from 'react';
import { Theme } from '../types/theme';
import { useTheme } from './useTheme';

export const useStylesheet = <T>(stylesheetCreator: (theme: Theme) => T) => {
  const theme = useTheme();
  return useMemo(() => stylesheetCreator(theme), [theme]);
};
