import {
  AuthApi,
  LoginRequest,
  SwitchCareerRequest,
} from '@polito-it/api-client';
import { useMutation } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

const useAuthClient = (): AuthApi => {
  const {
    clients: { auth: authClient },
  } = useApiContext();
  return authClient;
};

export const useLogin = () => {
  const authClient = useAuthClient();

  return useMutation((dto: LoginRequest) => {
    return authClient.login({ loginRequest: dto });
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();

  return useMutation(() => authClient.logout());
};

export const useSwitchCareer = () => {
  const authClient = useAuthClient();

  return useMutation((dto: SwitchCareerRequest) =>
    authClient.switchCareer({ switchCareerRequest: dto }),
  );
};
