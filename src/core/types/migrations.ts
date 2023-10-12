import { QueryClient } from '@tanstack/react-query';

import { PreferencesContextProps } from '../contexts/PreferencesContext';

export type Migration = {
  runBeforeVersion: string;
  run: ((p: PreferencesContextProps, q: QueryClient) => Promise<void>)[];
};
