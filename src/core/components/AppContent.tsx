import { useEffect, useState } from 'react';
import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';
import { useBottomModal } from '../hooks/useBottomModal';
import { useCheckForUpdate } from '../hooks/useCheckForUpdate';
import { MigrationService } from '../migrations/MigrationService';
import { BottomModal } from './BottomModal';
import { GuestNavigator } from './GuestNavigator';
import { NewVersionModal } from './NewVersionModal';
import { RootNavigator } from './RootNavigator';

export const AppContent = () => {
  const { isLogged } = useApiContext();
  const { mutateAsync: updateAppInfo } = useUpdateAppInfo();
  const [clientPatchOk, setClientPatchOk] = useState(false);
  const preferences = usePreferencesContext();
  const queryClient = useQueryClient();
  const { isSplashLoaded } = useSplashContext();

  const {
    close: closeModal,
    open: showModal,
    modal: bottomModal,
  } = useBottomModal();
  const { needsToUpdate, latestAppVersion, storeUrl } = useCheckForUpdate();
  const [versionModalVisible, setVersionModalVisible] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    if (!isSplashLoaded || needsToUpdate === undefined) return;
    if (needsToUpdate === false) {
      setVersionModalVisible(false);
      return;
    }
    setVersionModalVisible(true);
    showModal(
      <NewVersionModal
        close={closeModal}
        newVersion={latestAppVersion!}
        storeUrl={storeUrl!}
      />,
    );
  }, [
    needsToUpdate,
    isSplashLoaded,
    closeModal,
    showModal,
    latestAppVersion,
    storeUrl,
  ]);

  useEffect(() => {
    MigrationService.migrateIfNeeded(preferences, queryClient);
  }, [preferences, queryClient]);

  if (MigrationService.needsMigration(preferences)) return null;

  return (
    <>
      <BottomModal
        dismissable
        {...bottomModal}
        onModalHide={() => setVersionModalVisible(false)}
      />
      {isLogged ? (
        <RootNavigator versionModalIsOpen={versionModalVisible} />
      ) : (
        <GuestNavigator />
      )}
    </>
  );
};
