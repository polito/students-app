import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useOfflineDisabled } from '../hooks/useOfflineDisabled.ts';
import { MigrationService } from '../migrations/MigrationService';
import { useUpdateAppInfo } from '../queries/authHooks.ts';
import { GuestNavigator } from './GuestNavigator';
import { RootNavigator } from './RootNavigator';

export const AppContent = () => {
  const { isLogged } = useApiContext();
  const { mutateAsync: updateAppInfo } = useUpdateAppInfo();
  const [clientPatchOk, setClientPatchOk] = useState(false);
  const preferences = usePreferencesContext();
  const queryClient = useQueryClient();
  const isOffline = useOfflineDisabled();

  useEffect(() => {
    if (clientPatchOk || !isLogged || isOffline) return;
    // TODO handle suggestUpdate field in new version in UpdateAppInfo response
    updateAppInfo()
      .then(() => setClientPatchOk(true))
      .catch(console.warn);
  }, [isLogged, isOffline, updateAppInfo, clientPatchOk]);

  useEffect(() => {
    MigrationService.migrateIfNeeded(preferences, queryClient);
  }, [preferences, queryClient]);

  if (MigrationService.needsMigration(preferences)) return null;

  return isLogged ? <RootNavigator /> : <GuestNavigator />;
};
