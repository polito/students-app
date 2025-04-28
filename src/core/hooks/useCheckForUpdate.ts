import { useEffect, useState } from 'react';
import { checkVersion } from 'react-native-check-version';

import { GITHUB_URL } from '../constants.ts';
import { useSplashContext } from '../contexts/SplashContext.ts';
import { getFcmToken, useUpdateAppInfo } from '../queries/authHooks.ts';

type UpdateInfo = {
  needsUpdate?: boolean;
  version?: string;
  url?: string;
  hasMessaging?: boolean;
  source?: 'store' | 'github';
};
export const useCheckForUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});
  const { mutateAsync: updateAppInfo } = useUpdateAppInfo();
  const { isSplashLoaded } = useSplashContext();

  useEffect(() => {
    if (!isSplashLoaded) return;
    async function getLatestVersion() {
      try {
        let token: string | void | null = null;
        try {
          token = await getFcmToken(false);
        } catch (_) {
          // Ignore error
        }
        const checkVersionResponse = await new Promise<UpdateInfo>((ok, no) => {
          // Timeout to ensure dependent modals are not blocked if this takes too long
          const timeout = setTimeout(() => {
            no(new Error('Timeout exceeded'));
          }, 3000);
          updateAppInfo(token)
            .then(({ data }) => {
              if (data.suggestUpdate) {
                checkVersion()
                  .then(res => {
                    if (res.error) {
                      no(new Error(res.error.message));
                    }
                    ok(res);
                  })
                  .catch(no);
              } else {
                ok({
                  needsUpdate: false,
                });
              }
            })
            .finally(() => {
              clearTimeout(timeout);
            });
        });
        setUpdateInfo({
          needsUpdate: checkVersionResponse.needsUpdate,
          version: checkVersionResponse.version,
          url: token ? checkVersionResponse.url : GITHUB_URL,
          source: token ? 'store' : 'github',
          hasMessaging: !!token,
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
