import { createContext } from 'react';

import { Theme } from '../types/Theme';

export const ThemeContext = createContext<Theme | undefined>(undefined);
