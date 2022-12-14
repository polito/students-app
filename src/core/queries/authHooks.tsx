import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Keychain from 'react-native-keychain';

import { AuthApi, LoginRequest, SwitchCareerRequest } from '@polito/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';
import { STUDENT_QUERY_KEY } from './studentHooks';

const useAuthClient = (): AuthApi => {
  const {
    clients: { auth: authClient },
  } = useApiContext();
  return authClient;
};

export const useLogin = () => {
  const authClient = useAuthClient();

  return useMutation((dto: LoginRequest) => {
    dto.client = {
      name: 'Students app',
    };

    return Promise.all([
      DeviceInfo.getDeviceName(),
      DeviceInfo.getModel(),
      DeviceInfo.getManufacturer(),
    ])
      .then(([name, model, manufacturer]) => {
        dto.device = {
          name,
          platform: Platform.OS,
          version: `${Platform.Version}`,
          model,
          manufacturer,
        };
      })
      .then(() => {
        return authClient.login({ loginRequest: dto });
      });
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: async () => {
      await Keychain.resetGenericPassword();
      await queryClient.invalidateQueries([]);
      refreshContext();
    },
    onError: error => {
      console.debug('errorLogout', error);
    },
  });
};

export const useSwitchCareer = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: (dto?: SwitchCareerRequest) =>
      authClient.switchCareer({ switchCareerRequest: dto }),
    onSuccess: data => {
      Keychain.resetGenericPassword().then(() => {
        refreshContext(data.data.token);
        Keychain.setGenericPassword(data.data.clientId, data.data.token).then(
          () => queryClient.invalidateQueries([STUDENT_QUERY_KEY]),
        );
      });
    },
    onError: error => {
      console.debug('onError', error);
    },
  });
};
