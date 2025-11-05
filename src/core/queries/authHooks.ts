import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';

import { AuthApi, LoginRequest, SwitchCareerRequest } from '@polito/api-client';
import type {
  AppInfoRequest,
  EnrolMfaRequest,
  ValidateMfaRequest,
} from '@polito/api-client/models';
import { getApp } from '@react-native-firebase/app';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { UserStackParamList } from '~/features/user/components/UserNavigator.tsx';

import { t } from 'i18next';

import { isEnvProduction } from '../../utils/env';
import {
  getCredentials,
  resetCredentials,
  setCredentials,
} from '../../utils/keychain.ts';
import { ApiError, pluckData, rethrowApiError } from '../../utils/queries';
import { DEFAULT_CHPASS_URL, DEFAULT_SSO_LOGIN_URL } from '../constants.ts';
import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { WebviewType, useOpenInAppLink } from '../hooks/useOpenInAppLink.ts';
import { QueryStorage } from '../providers/ApiProvider.tsx';
import { RootParamList } from '../types/navigation.ts';

export const WEBMAIL_LINK_QUERY_KEY = ['webmailLink'];
export const MFA_CHALLENGE_QUERY_KEY = ['mfaChallenge'];
export const MFA_STATUS_QUERY_KEY = ['mfaStatus'];

const useAuthClient = (): AuthApi => {
  return new AuthApi();
};

export async function getFcmToken(
  catchException: boolean = true,
): Promise<string | undefined> {
  if (!isEnvProduction) return undefined;

  try {
    return await getApp().messaging().getToken();
  } catch (e) {
    if (!catchException) {
      throw e;
    }
    console.error(e);
    Alert.alert(t('common.error'), t('loginScreen.fcmUnsupported'));
  }

  return undefined;
}

export const getClientId = async (): Promise<string> => {
  try {
    const credentials = await getCredentials();
    if (credentials && credentials.username) {
      return credentials.username;
    }
  } catch (e) {
    console.warn("Keychain couldn't be accessed!", e);
  }
  const clientId = uuid.v4();
  await setCredentials(clientId);
  return clientId;
};

export const useLogin = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();
  const queryClient = useQueryClient();

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
          updatePreference('loginUid', null); // needed to exit from login screen
          if (res?.type !== 'student') {
            throw new UnsupportedUserTypeError(
              `User type ${res?.type} not supported by this app`,
            );
          }
          queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
          return res;
        })
        .catch(rethrowApiError);
    },
    onSuccess: async data => {
      const { token, clientId, username } = data;
      /* refreshing context now is just to speed up login,
      and avoid waiting for the setCredentials & preferences update,
      since it's already refreshed upon username change in prefs */
      refreshContext({ username, token });
      await setCredentials(clientId, token);
      updatePreference('username', username);
    },
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();
  return useMutation({
    mutationFn: () => {
      return authClient.logout();
    },
    onSuccess: async () => {
      updatePreference('politoAuthnEnrolmentStatus', {});
      refreshContext();
      QueryStorage.clear().catch(e => {
        console.error('Error clearing query storage:', e);
      });
      queryClient.removeQueries();
      await resetCredentials();
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
      const { token, username, clientId } = data;
      /* refreshing context now is just to speed up career switch,
      and avoid waiting for the setCredentials & preferences update,
      since it's already refreshed upon username change in prefs */
      refreshContext({ token, username });
      queryClient.invalidateQueries();

      await setCredentials(clientId, token);
      updatePreference('username', username);
    },
  });
};

export const useUpdateAppInfo = () => {
  const authClient = useAuthClient();

  return useMutation({
    mutationFn: async (fcmToken: string | void | null) => {
      // mutation requires a variable, an undefined string is not accepted
      return Promise.all([
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getVersion(),
        fcmToken === null ? undefined : fcmToken || getFcmToken(),
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

export const GetWebmailLink = async () => {
  const authClient = useAuthClient();

  return authClient.getMailLink().then(pluckData);
};

export const useCheckMfa = (autoFetch = false) => {
  const authClient = useAuthClient();

  return useQuery({
    queryKey: MFA_STATUS_QUERY_KEY,
    staleTime: autoFetch ? undefined : Infinity,
    gcTime: autoFetch ? undefined : Infinity,
    queryFn: () =>
      authClient
        .getMfaStatus()
        .then(pluckData)
        .then(res => {
          if (!res) {
            throw new Error('Failed to get MFA status');
          }
          return res;
        }),
  });
};

export const useMfaEnrol = () => {
  const authClient = useAuthClient();

  return useMutation({
    mutationFn: (dto: EnrolMfaRequest) =>
      authClient
        .enrolMfa({ enrolMfaRequest: dto })
        .then(pluckData)
        .catch(rethrowApiError),
  });
};

export const useMfaAuth = () => {
  const authClient = useAuthClient();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();

  return useMutation({
    mutationFn: (dto: ValidateMfaRequest) =>
      authClient
        .validateMfa({ validateMfaRequest: dto })
        .then(pluckData)
        .then(res => {
          if (!res) throw new Error('MFA verification failed');
          return res;
        })
        .catch(rethrowApiError),

    onSuccess: async data => {
      data.success === true && navigation.goBack();
    },
  });
};

export const useMfaChallengeHandler = () => {
  const authClient = useAuthClient();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();

  return useQuery({
    queryKey: MFA_CHALLENGE_QUERY_KEY,
    enabled: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      authClient
        .fetchChallenge()
        .then(pluckData)
        .then(data => {
          if (data?.challenge) {
            navigation.navigate('ProfileTab', {
              screen: 'PolitoAuthenticator',
              params: {
                activeView: 'auth',
                challenge: data,
              },
              initial: false,
            });
          }
          return data;
        })
        .catch(rethrowApiError)
        .catch(e => {
          if (e instanceof ApiError && e.responseCode === 404) {
            return {};
          }
          throw e;
        }),
  });
};

export const useSSOLoginInitiator = () => {
  const { updatePreference } = usePreferencesContext();

  const sessionOpener = useOpenInAppLink(WebviewType.LOGIN);

  return useCallback(
    async (forceMfa: boolean = false) => {
      const uid = uuid.v4();
      updatePreference('loginUid', uid);

      const urlParts = [DEFAULT_SSO_LOGIN_URL, `uid=${uid}`];
      if (forceMfa) {
        urlParts.push('mfa');
      }

      await sessionOpener(urlParts.join('&')).catch(console.error);
    },
    [sessionOpener, updatePreference],
  );
};

export const useVisitChpass = () => {
  const sessionOpener = useOpenInAppLink(WebviewType.LOGIN);

  return useCallback(async () => {
    await sessionOpener(DEFAULT_CHPASS_URL).catch(console.error);
  }, [sessionOpener]);
};
