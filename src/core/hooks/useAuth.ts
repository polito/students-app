import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import uuid from 'react-native-uuid';

import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '~/core/errors/UnsupportedUserTypeError';
import { useDeviceLanguage } from '~/core/hooks/useDeviceLanguage';
import { WebviewType, useOpenInAppLink } from '~/core/hooks/useOpenInAppLink';
import { useLogin } from '~/core/queries/authHooks';

export const useAuth = (ssoKey?: string) => {
  const { t } = useTranslation();
  const { updatePreference, loginUid } = usePreferencesContext();
  const { mutateAsync: login, isPending: isLoading } = useLogin();
  const language = useDeviceLanguage();
  const sessionOpener = useOpenInAppLink(WebviewType.LOGIN);

  const handleLoginError = useCallback(
    (e: Error) => {
      if (e instanceof UnsupportedUserTypeError) {
        Alert.alert(t('common.error'), t('loginScreen.unsupportedUserType'));
      } else {
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

  const handleSSO = useCallback(async () => {
    const uid = uuid.v4();
    await updatePreference('loginUid', uid);
    const url = `https://app.didattica.polito.it/auth/students/start?uid=${uid}&platform=${Platform.OS}`;
    sessionOpener(url).catch(console.error);
  }, [updatePreference, sessionOpener]);

  useEffect(() => {
    if (loginUid && ssoKey) {
      login({
        uid: loginUid,
        key: ssoKey,
        preferences: { language },
        loginType: 'sso',
      }).catch(handleLoginError);
      updatePreference('loginUid', undefined);
    }
  }, [loginUid, ssoKey, login, language, updatePreference, handleLoginError]);

  return {
    handleBasicLogin,
    handleSSO,
    isLoading,
  };
};
