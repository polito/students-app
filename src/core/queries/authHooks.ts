import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Keychain from 'react-native-keychain';

import { AuthApi, LoginRequest, SwitchCareerRequest } from '@polito/api-client';
import messaging from '@react-native-firebase/messaging';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';
import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { STUDENT_QUERY_KEY } from './studentHooks';

const useAuthClient = (): AuthApi => {
  const {
    clients: { auth: authClient },
  } = useApiContext();
  return authClient!;
};

export const useLogin = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: (dto: LoginRequest) => {
      dto.client = { name: 'Students app' };

      return Promise.all([
        DeviceInfo.getDeviceName(),
        DeviceInfo.getModel(),
        DeviceInfo.getManufacturer(),
        messaging().getToken(),
      ])
        .then(([name, model, manufacturer, fcmRegistrationToken]) => {
          dto.device = {
            name,
            platform: Platform.OS,
            version: `${Platform.Version}`,
            model,
            manufacturer,
          };
          dto.preferences = { ...dto.preferences, fcmRegistrationToken };
        })
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
      const { token, clientId, username } = data;
      await Keychain.setGenericPassword(clientId, token);
      refreshContext({ username, token });
    },
    onError: error => {
      console.debug('loginError', JSON.stringify(error));
    },
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: async () => {
      refreshContext();
      await Keychain.resetGenericPassword();
      // await queryClient.invalidateQueries([]);
    },
  });
};

export const useSwitchCareer = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: (dto?: SwitchCareerRequest) =>
      authClient.switchCareer({ switchCareerRequest: dto }).then(pluckData),
    onSuccess: data => {
      Keychain.resetGenericPassword().then(() => {
        refreshContext({
          token: data.token,
          username: data.username,
        });
        Keychain.setGenericPassword(data.clientId, data.token).then(() =>
          queryClient.invalidateQueries([STUDENT_QUERY_KEY]),
        );
      });
    },
  });
};
