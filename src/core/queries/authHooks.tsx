import * as SecureStore from 'expo-secure-store';

import {
  LoginRequest,
  SwitchCareerRequest,
} from '@polito-it/api-client/models';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SECURE_STORE_TOKEN_KEY, useApiContext } from '../contexts/ApiContext';

export const useLogin = () => {
  const {
    clients: { auth: authClient },
    refreshContext,
  } = useApiContext();

  return useMutation(
    (dto: LoginRequest) => {
      return authClient.login({ loginRequest: dto });
    },
    {
      onSuccess: async data => {
        await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, data.data.token);
        refreshContext(data.data.token);
      },
    },
  );
};

export const useLogout = () => {
  const {
    clients: { auth: authClient },
    refreshContext,
  } = useApiContext();
  const client = useQueryClient();

  return useMutation(() => authClient.logout(), {
    onSuccess: async () => {
      await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
      refreshContext();
      return client.invalidateQueries([]);
    },
  });
};

export const useSwitchCareer = () => {
  const {
    clients: { auth: authClient },
    refreshContext,
  } = useApiContext();
  const client = useQueryClient();

  return useMutation(
    (dto: SwitchCareerRequest) =>
      authClient.switchCareer({ switchCareerRequest: dto }),
    {
      onSuccess: async data => {
        await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, data.data.token);
        refreshContext(data.data.token);
        return client.invalidateQueries([]);
      },
    },
  );
};
