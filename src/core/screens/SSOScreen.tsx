import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';

import { CtaButton } from '@lib/ui/components/CtaButton.tsx';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import { Theme } from '@lib/ui/types/Theme.ts';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { GuestStackParamList } from '~/core/components/GuestNavigator.tsx';
import { PolitoLogo } from '~/core/components/Logo.tsx';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext.ts';
import { UnsupportedUserTypeError } from '~/core/errors/UnsupportedUserTypeError.ts';
import { useDeviceLanguage } from '~/core/hooks/useDeviceLanguage.ts';
import {
  WebviewType,
  useOpenInAppLink,
} from '~/core/hooks/useOpenInAppLink.ts';
import { useLogin } from '~/core/queries/authHooks.ts';

type Props = NativeStackScreenProps<GuestStackParamList, 'SSO'>;

type SSOScreenRouteProp = RouteProp<
  { SSO: { uid: string; key: string } },
  'SSO'
>;

export const SSOScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { updatePreference, loginUid } = usePreferencesContext();
  const { mutateAsync: login, isPending: isLoading } = useLogin();
  const styles = useStylesheet(createStyles);
  const { spacing } = useTheme();
  const language = useDeviceLanguage();
  const route = useRoute<SSOScreenRouteProp>();
  const { key } = route.params || {};

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

  const sessionOpener = useOpenInAppLink(WebviewType.LOGIN);

  const handleSSO = async () => {
    const uid = uuid.v4();
    await updatePreference('loginUid', uid);
    // Try without redirect_uri first - the server might be configured to redirect automatically
    const url = `https://app.didattica.polito.it/auth/students/start?uid=${uid}&platform=${Platform.OS}`;
    sessionOpener(url).catch(console.error);
  };

  useEffect(() => {
    if (loginUid && key) {
      login({
        uid: loginUid,
        key,
        preferences: { language },
        loginType: 'sso',
      }).catch(handleLoginError);
      updatePreference('loginUid', undefined);
    }
  }, [loginUid, key, login, language, updatePreference, handleLoginError]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <PolitoLogo width="100%" height="100%" />
        </View>
      </View>
      <CtaButtonContainer absolute={true} style={{ gap: spacing[0] }}>
        <CtaButton
          absolute={false}
          title={t('ssoScreen.ssoButton')}
          action={handleSSO}
          loading={isLoading}
        />
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          <Text variant="link" style={styles.textLink}>
            {t('ssoScreen.ssoLink')}
          </Text>
        </TouchableOpacity>
        <View style={{ height: spacing[10] }} />
      </CtaButtonContainer>
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      width: '30%',
      aspectRatio: 120 / 168,
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    link: {
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      marginBottom: spacing[3],
    },
    textLink: { textDecorationLine: 'underline' },
  });
