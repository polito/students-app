import { useCallback } from 'react';
import Constants from 'expo-constants';
import { onlineManager } from '@tanstack/react-query';
import { useMatomo } from 'matomo-tracker-react-native';
import appJson from '../../../app.json';
import { device } from '../../config/device';
import { language } from '../../i18n';

export const useUserInfoAsync = () =>
  useCallback(async () => {
    const ua = await Constants.getWebViewUserAgentAsync();
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _cvar: JSON.stringify({ '1': ['App-Version', appJson.expo.version] }),
      lang: language,
      res: `${device.width}x${device.height}`,
      ua,
    };
  }, []);

export const useTrackScreenViewAsync = () => {
  const { trackScreenView } = useMatomo();
  const userInfoAsync = useUserInfoAsync();

  return useCallback(
    async (name: string) => {
      const userInfo = await userInfoAsync();

      onlineManager.isOnline() && trackScreenView({ name, userInfo });
    },
    [userInfoAsync],
  );
};

export const useTrackAppStartAsync = () => {
  const { trackAppStart } = useMatomo();
  const userInfoAsync = useUserInfoAsync();

  return useCallback(async () => {
    const userInfo = await userInfoAsync();

    onlineManager.isOnline() && trackAppStart({ userInfo });
  }, [userInfoAsync]);
};
