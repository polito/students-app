import { useEffect, useState } from 'react';
import VersionCheck from 'react-native-version-check';

import { isNil } from 'lodash';
import semver from 'semver/preload';

import { usePreferencesContext } from '../contexts/PreferencesContext';

type UpdateInfo = {
  needsToUpdate?: boolean;
  latestAppVersion?: string;
  storeUrl?: string;
};
export const useCheckForUpdate = () => {
  const { lastInstalledVersion } = usePreferencesContext();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});

  useEffect(() => {
    async function getLatestVersion() {
      try {
        if (!lastInstalledVersion || !semver.valid(lastInstalledVersion))
          return;
        const latestVersion = await VersionCheck.getLatestVersion();
        if (!latestVersion || !semver.valid(latestVersion)) return;
        const needsToUpdate = semver.neq(latestVersion, lastInstalledVersion);
        if (needsToUpdate) {
          const storeUrl = await VersionCheck.getStoreUrl({
            appID: '6443913305',
          });
          setUpdateInfo({
            needsToUpdate,
            latestAppVersion: latestVersion,
            storeUrl,
          });
        }
      } catch (e) {
        console.warn('Error while checking for updates', e);
      }
    }
    getLatestVersion();
  }, [lastInstalledVersion]);

  const { needsToUpdate, latestAppVersion, storeUrl } = updateInfo;
  const shouldUpdate =
    needsToUpdate === true && !isNil(latestAppVersion) && !isNil(storeUrl);

  return {
    needsToUpdate: shouldUpdate,
    latestAppVersion,
    storeUrl,
  };
};
