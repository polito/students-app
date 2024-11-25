import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { MigrationService } from '../migrations/MigrationService';
import { GuestNavigator } from './GuestNavigator';
import { RootNavigator } from './RootNavigator';

export const AppContent = () => {
  const { isLogged } = useApiContext();

  const preferences = usePreferencesContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    MigrationService.migrateIfNeeded(preferences, queryClient);
  }, [queryClient]); // TODO: add preferences to dependencies in the next release

  if (MigrationService.needsMigration(preferences)) return null;

  return isLogged ? <RootNavigator /> : <GuestNavigator />;
};
