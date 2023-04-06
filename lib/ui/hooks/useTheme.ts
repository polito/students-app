import { useContext } from 'react';

import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext)
    throw new Error(
      'No ThemeContext.Provider found when calling useThemeContext.',
    );
  return themeContext;
};
