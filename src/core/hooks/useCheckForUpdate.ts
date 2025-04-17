import { useEffect, useState } from 'react';
import { CheckVersionResponse, checkVersion } from 'react-native-check-version';

import { useSplashContext } from '../contexts/SplashContext.ts';
import { useUpdateAppInfo } from '../queries/authHooks.ts';

type UpdateInfo = {
  needsToUpdate?: boolean;
  latestAppVersion?: string;
  storeUrl?: string;
};
export const useCheckForUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});
  const { mutateAsync: updateAppInfo } = useUpdateAppInfo();
  const { isSplashLoaded } = useSplashContext();

  useEffect(() => {
    if (!isSplashLoaded) return;
    async function getLatestVersion() {
      try {
        const checkVersionResponse = await new Promise<CheckVersionResponse>(
          (ok, no) => {
            // Timeout to ensure dependent modals are not blocked if this takes too long
            const timeout = setTimeout(() => {
              no(new Error('Timeout exceeded'));
            }, 3000);

            updateAppInfo()
              .then(({ data }) => {
                checkVersion()
                  .then(res => {
                    if (res.error) {
                      no(new Error(res.error.message));
                    }
                    const needsUpdate = data.suggestUpdate && res.needsUpdate;
                    ok({ ...res, needsUpdate });
                  })
                  .catch(no);
              })
              .catch(no)
              .finally(() => {
                clearTimeout(timeout);
              });
          },
        );
        setUpdateInfo({
          needsToUpdate: checkVersionResponse.needsUpdate,
          latestAppVersion: checkVersionResponse.version,
          storeUrl: checkVersionResponse.url,
        });
      } catch (e) {
        console.warn('Error while checking for updates', e);
        setUpdateInfo(prev => ({
          ...prev,
          needsToUpdate: false,
        }));
      }
    }
    getLatestVersion();
  }, [updateAppInfo, isSplashLoaded]);

  return updateInfo;
};
