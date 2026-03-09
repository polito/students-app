import { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { useDownloadsContext } from '../contexts/DownloadsContext';
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
  const { isLogged, username } = useApiContext();
  const preferences = usePreferencesContext();
  const { syncLocalFilesToDb } = useDownloadsContext();
  const queryClient = useQueryClient();
  const { isSplashLoaded } = useSplashContext();
  const hasSyncedFiles = useRef(false);

  const {
    close: closeModal,
    open: showModal,
    modal: bottomModal,
  } = useBottomModal();
  const { needsUpdate, version, url, source } = useCheckForUpdate();
  const [versionModalVisible, setVersionModalVisible] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    if (!isSplashLoaded) return;
    if (needsUpdate === false) {
      setVersionModalVisible(false);
      return;
    }
    if (
      needsUpdate === undefined ||
      version === undefined ||
      url === undefined ||
      source === undefined
    )
      return;
    setVersionModalVisible(true);
    showModal(
      <NewVersionModal
        close={closeModal}
        newVersion={version}
        url={url}
        source={source}
      />,
    );
  }, [
    needsUpdate,
    isSplashLoaded,
    source,
    closeModal,
    showModal,
    version,
    url,
  ]);

  useEffect(() => {
    MigrationService.migrateIfNeeded(preferences, queryClient);
  }, [preferences, queryClient]);

  useEffect(() => {
    if (isLogged && username && !hasSyncedFiles.current) {
      hasSyncedFiles.current = true;
      syncLocalFilesToDb().catch(() => {});
    }
  }, [isLogged, username, syncLocalFilesToDb]);

  if (MigrationService.needsMigration(preferences)) return null;
  return (
    <>
      <BottomModal
        dismissable
        {...bottomModal}
        onModalHide={() => setVersionModalVisible(false)}
      />
      {isLogged && !preferences.loginUid ? (
        <RootNavigator versionModalIsOpen={versionModalVisible} />
      ) : (
        <GuestNavigator />
      )}
    </>
  );
};
