import { QueryClient } from '@tanstack/react-query';

import { PreferencesContextProps } from '../contexts/PreferencesContext';

export const invalidateCache = async (
  preferences: PreferencesContextProps,
  client: QueryClient,
) => {
  client.clear();
};
