import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  return useContext(ThemeContext);
};
