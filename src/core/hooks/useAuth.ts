import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '~/core/errors/UnsupportedUserTypeError';
import { useDeviceLanguage } from '~/core/hooks/useDeviceLanguage';
import {
  useLogin,
  useSSOLoginInitiator,
  useVisitChpass,
} from '~/core/queries/authHooks';

export const useAuth = (ssoKey?: string) => {
  const { t } = useTranslation();
  const { updatePreference, loginUid } = usePreferencesContext();
  const { mutateAsync: login, isPending: isLoading } = useLogin();
  const language = useDeviceLanguage();
  const handleSSO = useSSOLoginInitiator();
  const viewChpass = useVisitChpass();

  const handleLoginError = useCallback(
    (e: Error) => {
      if (e instanceof UnsupportedUserTypeError) {
        Alert.alert(t('common.error'), t('loginScreen.unsupportedUserType'));
      } else {
        console.error(e);
        Alert.alert(
          t('loginScreen.authnError'),
          t('loginScreen.authnErrorDescription'),
        );
      }
    },
    [t],
  );

  const handleBasicLogin = useCallback(
    (username: string, password: string) =>
      login({
        username,
        password,
        preferences: { language },
        loginType: 'basic',
      }).catch(handleLoginError),
    [login, language, handleLoginError],
  );

  useEffect(() => {
    if (loginUid && ssoKey) {
      login({
        uid: loginUid,
        key: ssoKey,
        preferences: { language },
        loginType: 'sso',
      }).catch(handleLoginError);
    }
  }, [loginUid, ssoKey, login, language, updatePreference, handleLoginError]);

  return {
    handleBasicLogin,
    handleSSO,
    viewChpass,
    isLoading,
  };
};
