import { Alert, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import 'react-native-get-random-values';
import Keychain from 'react-native-keychain';

import { AuthApi, LoginRequest, SwitchCareerRequest } from '@polito/api-client';
import type { AppInfoRequest } from '@polito/api-client/models';
import messaging from '@react-native-firebase/messaging';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { t } from 'i18next';
import { v4 as uuidv4 } from 'uuid';

import { isEnvProduction } from '../../utils/env';
import { pluckData } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { asyncStoragePersister } from '../providers/ApiProvider';

export const NO_TOKEN = '__EMPTY__';

const useAuthClient = (): AuthApi => {
  return new AuthApi();
};

export async function resetKeychain(): Promise<void> {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    await Keychain.setGenericPassword(credentials.username, NO_TOKEN);
  }
}

async function getFcmToken(): Promise<string | undefined> {
  if (!isEnvProduction) return undefined;

  try {
    return await messaging().getToken();
  } catch (_) {
    Alert.alert(t('common.error'), t('loginScreen.fcmUnsupported'));
  }

  return undefined;
}

const getClientId = async (): Promise<string> => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username) {
      return credentials.username;
    }
  } catch (e) {
    console.warn("Keychain couldn't be accessed!", e);
  }
  const clientId = uuidv4();
  await Keychain.setGenericPassword(clientId, NO_TOKEN);
  return clientId;
};

export const useLogin = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();

  return useMutation({
    mutationFn: (dto: LoginRequest) => {
      return Promise.all([
        getClientId(),
        DeviceInfo.getDeviceName(),
        DeviceInfo.getModel(),
        DeviceInfo.getManufacturer(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getVersion(),
        getFcmToken(),
      ])
        .then(
          ([
            id,
            name,
            model,
            manufacturer,
            buildNumber,
            appVersion,
            fcmRegistrationToken,
          ]) => {
            dto.device = {
              name,
              platform: Platform.OS,
              version: `${Platform.Version}`,
              model,
              manufacturer,
            };
            dto.client = {
              name: 'students-app',
              buildNumber,
              appVersion,
              id,
              fcmRegistrationToken,
            };
            dto.preferences = { ...dto.preferences };
          },
        )
        .then(() => authClient.login({ loginRequest: dto }))
        .then(pluckData)
        .then(res => {
          if (res?.type !== 'student') {
            throw new UnsupportedUserTypeError(
              `User type ${res?.type} not supported by this app`,
            );
          }
          return res;
        });
    },
    onSuccess: async data => {
      const { token, clientId: clientIdentifier, username } = data;
      updatePreference('username', username);
      refreshContext({ username, token });
      await Keychain.setGenericPassword(clientIdentifier, token);
    },
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: async () => {
      refreshContext();
      asyncStoragePersister.removeClient();
      queryClient.removeQueries();
      await resetKeychain();
    },
  });
};

export const useSwitchCareer = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto?: SwitchCareerRequest) =>
      authClient.switchCareer({ switchCareerRequest: dto }).then(pluckData),
    onSuccess: async data => {
      const { token, username } = data;
      refreshContext({
        token,
        username,
      });
      updatePreference('username', username);
      asyncStoragePersister.removeClient();
      queryClient.invalidateQueries([]);
      await Keychain.setGenericPassword(data.clientId, data.token);
    },
  });
};

export const useUpdateAppInfo = () => {
  const authClient = useAuthClient();

  return useMutation({
    mutationFn: async (fcmToken: string | void) => {
      // mutation requires a variable, an undefined string is not accepted
      return Promise.all([
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getVersion(),
        fcmToken || getFcmToken(),
      ]).then(([buildNumber, appVersion, fcmRegistrationToken]) => {
        const dto: AppInfoRequest = {
          buildNumber,
          appVersion,
          fcmRegistrationToken,
        };
        return authClient.appInfo({
          appInfoRequest: dto,
        });
      });
    },
  });
};
