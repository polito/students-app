import { useEffect, useState } from 'react';

import { onlineManager, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { MigrationService } from '../migrations/MigrationService';
import { useUpdateAppInfo } from '../queries/authHooks.ts';
import { GuestNavigator } from './GuestNavigator';
import { RootNavigator } from './RootNavigator';

export const AppContent = () => {
  const { isLogged } = useApiContext();

  const preferences = usePreferencesContext();
  const queryClient = useQueryClient();
  const { mutate: updateAppInfo } = useUpdateAppInfo();
  const [updateTriggered, setUpdateTriggered] = useState(false);

  useEffect(() => {
    if (isLogged && !updateTriggered && onlineManager.isOnline()) {
      setUpdateTriggered(true);
      updateAppInfo();
    }
  }, [isLogged, updateAppInfo, updateTriggered]);

  useEffect(() => {
    MigrationService.migrateIfNeeded(preferences, queryClient);
  }, [preferences, queryClient]);

  if (MigrationService.needsMigration(preferences)) return null;

  return isLogged ? <RootNavigator /> : <GuestNavigator />;
};
